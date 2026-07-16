import { describe, expect, test } from "bun:test";
import type {
	ExpenseHistoryImportCommitResult,
	ExpenseHistoryImportPreview,
} from "@/utility/expenseHistoryImportContracts";
import { ExpenseHistoryReplacementRequiredError } from "./importExpenseHistory";
import { createExpenseHistoryImportHandlers } from "./importHttp";

const csv = `IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
CH00;03.06.2026;Synthetic debit;-12.50;100;03.06.2026`;
const preview: ExpenseHistoryImportPreview = {
	month: "2026-06",
	debitCount: 1,
	skippedCreditCount: 0,
	totalDebitAmount: 12.5,
	warnings: [],
	replacementRequired: false,
};

function post(body: unknown) {
	return new Request("https://example.test/api/expense-history/import", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("expense history import HTTP API", () => {
	test("requires administrator authentication", async () => {
		const handlers = createExpenseHistoryImportHandlers({
			authorize: async () => false,
			preview: async () => preview,
			commit: async () => ({
				...preview,
				replacedExistingMonth: false,
			}),
		});
		const response = await handlers.preview(
			post({ csv, sourceFilename: "synthetic.csv" }),
		);
		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: "Unauthorized" });
	});

	test("returns the preview contract and validates request bodies", async () => {
		const handlers = createExpenseHistoryImportHandlers({
			authorize: async () => true,
			preview: async () => preview,
			commit: async () => ({
				...preview,
				replacedExistingMonth: false,
			}),
		});
		const response = await handlers.preview(
			post({ csv, sourceFilename: "synthetic.csv" }),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(preview);
		const invalid = await handlers.preview(post({ sourceFilename: "x.csv" }));
		expect(invalid.status).toBe(400);
		expect(await invalid.json()).toMatchObject({
			code: "INVALID_IMPORT_REQUEST",
		});
	});

	test("returns 409 for an unacknowledged replacement", async () => {
		const handlers = createExpenseHistoryImportHandlers({
			authorize: async () => true,
			preview: async () => ({ ...preview, replacementRequired: true }),
			commit: async () => {
				throw new ExpenseHistoryReplacementRequiredError("2026-06");
			},
		});
		const response = await handlers.commit(
			post({ csv, sourceFilename: "synthetic.csv" }),
		);
		expect(response.status).toBe(409);
		expect(await response.json()).toMatchObject({
			code: "EXPENSE_HISTORY_REPLACEMENT_REQUIRED",
			month: "2026-06",
		});
	});

	test("accepts explicit replacement acknowledgement", async () => {
		let acknowledged = false;
		const result: ExpenseHistoryImportCommitResult = {
			...preview,
			replacementRequired: true,
			replacedExistingMonth: true,
		};
		const handlers = createExpenseHistoryImportHandlers({
			authorize: async () => true,
			preview: async () => preview,
			commit: async (body) => {
				acknowledged = body.replaceExistingMonth;
				return result;
			},
		});
		const response = await handlers.commit(
			post({
				csv,
				sourceFilename: "synthetic.csv",
				replaceExistingMonth: true,
			}),
		);
		expect(response.status).toBe(200);
		expect(acknowledged).toBe(true);
		expect(await response.json()).toEqual(result);
	});
});
