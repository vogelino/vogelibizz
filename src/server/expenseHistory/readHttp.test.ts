import { describe, expect, test } from "bun:test";
import type {
	ExpenseHistoryMonthDetail,
	ExpenseHistoryMonthSummary,
} from "@/utility/expenseHistoryContracts";
import {
	expenseHistoryMonthDetailSchema,
	expenseHistoryMonthsSchema,
} from "@/utility/expenseHistoryContracts";
import { createExpenseHistoryReadHandlers } from "./readHttp";

const months: ExpenseHistoryMonthSummary[] = [
	{
		month: "2026-06",
		importedAt: "2026-07-16T12:00:00.000Z",
		importedDebitCount: 1,
		skippedCreditCount: 2,
	},
];
const detail: ExpenseHistoryMonthDetail = {
	month: months[0],
	transactions: [
		{
			id: 7,
			bookedAt: "2026-06-03",
			valueDate: "2026-06-04",
			description: "Editable display value",
			amount: 12.5,
			originalDescription: "Immutable bank value",
			originalAmount: 15,
			category: "Software",
			type: "Freelance",
			expense: { id: 4, name: "Synthetic recurring" },
			lastModified: "2026-07-16T12:00:00.000Z",
		},
	],
	summary: { total: 12.5, matched: 12.5, other: 0 },
};

function request() {
	return new Request("https://example.test/api/expense-history/months");
}

describe("expense history read HTTP API", () => {
	test("requires administrator authentication", async () => {
		const handlers = createExpenseHistoryReadHandlers({
			authorize: async () => false,
			getMonths: async () => months,
			getMonth: async () => detail,
		});
		const response = await handlers.months(request());
		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: "Unauthorized" });
	});

	test("returns newest-first month summaries and the traceable row contract", async () => {
		const handlers = createExpenseHistoryReadHandlers({
			authorize: async () => true,
			getMonths: async () => months,
			getMonth: async () => detail,
		});
		const monthsResponse = await handlers.months(request());
		expect(
			expenseHistoryMonthsSchema.parse(await monthsResponse.json()),
		).toEqual(months);

		const monthResponse = await handlers.month(request(), "2026-06");
		expect(
			expenseHistoryMonthDetailSchema.parse(await monthResponse.json()),
		).toEqual(detail);
	});

	test("rejects malformed and missing selected months", async () => {
		const handlers = createExpenseHistoryReadHandlers({
			authorize: async () => true,
			getMonths: async () => months,
			getMonth: async () => null,
		});
		expect((await handlers.month(request(), "June")).status).toBe(400);
		const missing = await handlers.month(request(), "2026-05");
		expect(missing.status).toBe(404);
		expect(await missing.json()).toEqual({
			error: "No expense history exists for 2026-05.",
		});
	});
});
