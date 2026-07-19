import { Database } from "bun:sqlite";
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { utils, write } from "xlsx";
import { calculateExpenseHistorySummary } from "@/utility/expenseHistoryCalculations";
import type { ExpenseHistoryImportCommitRequest } from "@/utility/expenseHistoryImportContracts";
import {
	commitExpenseHistoryImport,
	type ExpenseHistoryImportDataset,
	type ExpenseHistoryImportPersistence,
	ExpenseHistoryReplacementRequiredError,
	previewExpenseHistoryImport,
} from "./importExpenseHistory";

const migrationDirectory = new URL("../../db/migrations/d1/", import.meta.url);
const migrationNames = [
	"0000_third_bullseye.sql",
	"0001_tranquil_tarot.sql",
	"0002_rare_golden_guardian.sql",
	"0003_swift_nitro.sql",
	"0004_abnormal_betty_brant.sql",
	"0005_cynical_hellcat.sql",
];
const migrationSql = (
	await Promise.all(
		migrationNames.map((name) =>
			Bun.file(new URL(name, migrationDirectory)).text(),
		),
	)
).join("\n");
type WorkbookTransaction = {
	date: string;
	description: string;
	amount: number;
	category?: string;
};

function workbookRequest(
	transactions: WorkbookTransaction[],
	replaceExistingMonths = false,
	sourceFilename = "synthetic.xlsx",
): ExpenseHistoryImportCommitRequest {
	const workbook = utils.book_new();
	utils.book_append_sheet(
		workbook,
		utils.aoa_to_sheet([
			["Finanzassistent - Transaktionen"],
			[],
			[
				"Datum",
				"Gegenpartei",
				"Betrag",
				"Währung",
				"Konto",
				"Kategorie",
				"Kontoinhaber",
				"Buchungstext",
			],
			...transactions.map(({ date, description, amount, category }) => [
				new Date(`${date}T00:00:00Z`),
				description,
				amount,
				"CHF",
				"Private account",
				category ?? "Allgemeines",
				"Test User",
				description,
			]),
		]),
		"Transactions",
	);
	return {
		workbookBase64: write(workbook, { type: "base64", bookType: "xlsx" }),
		sourceFilename,
		replaceExistingMonths,
	};
}

function request(replaceExistingMonths = false) {
	return workbookRequest(
		[
			{
				date: "2026-06-03",
				description: "Synthetic replacement",
				amount: -42.5,
			},
			{
				date: "2026-06-07",
				description: "Synthetic credit",
				amount: 10,
				category: "Weitere Einnahmen",
			},
		],
		replaceExistingMonths,
	);
}

class SqliteImportPersistence implements ExpenseHistoryImportPersistence {
	readonly database = new Database(":memory:");
	failAfterMonthInsert = false;

	constructor() {
		this.database.exec("PRAGMA foreign_keys = ON");
		this.database.exec(migrationSql);
	}

	async monthExists(month: string) {
		return Boolean(
			this.database
				.query("SELECT id FROM expense_months WHERE month = ?")
				.get(month),
		);
	}

	async writeMonthsAtomically(
		datasets: ExpenseHistoryImportDataset[],
		replaceExistingMonths: string[],
	) {
		const write = this.database.transaction(() => {
			for (const month of replaceExistingMonths) {
				this.database
					.query("DELETE FROM expense_months WHERE month = ?")
					.run(month);
			}
			for (const dataset of datasets) {
				const month = this.database
					.query(
						`INSERT INTO expense_months (
						month, source_filename, imported_at, last_modified,
						imported_debit_count, skipped_credit_count
					) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
					)
					.get(
						dataset.month,
						dataset.sourceFilename,
						"2026-07-16T12:00:00.000Z",
						"2026-07-16T12:00:00.000Z",
						dataset.debits.length,
						dataset.skippedCreditCount,
					) as { id: number };
				if (this.failAfterMonthInsert)
					throw new Error("Synthetic write failure");
				for (const debit of dataset.debits) {
					this.database
						.query(
							`INSERT INTO expense_transactions (
							expense_month_id, booked_at, value_date,
							original_description, description, original_amount, amount,
							category, source_order, created_at, last_modified
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
						)
						.run(
							month.id,
							debit.bookedAt,
							debit.valueDate,
							debit.description,
							debit.description,
							debit.amount,
							debit.amount,
							debit.category,
							debit.sourceOrder,
							"2026-07-16T12:00:00.000Z",
							"2026-07-16T12:00:00.000Z",
						);
				}
			}
		});
		write();
	}

	seedEditedMonth() {
		this.database.exec(`
			INSERT INTO expenses (
				id, created_at, last_modified, name, category, type, rate,
				original_price, original_currency
			) VALUES (42, 'old', 'old', 'Synthetic recurring', 'Software',
				'Personal', 'Monthly', 99, 'CHF');
			INSERT INTO expense_months (
				id, month, source_filename, imported_at, last_modified,
				imported_debit_count, skipped_credit_count
			) VALUES (5, '2026-06', 'old.xlsx', 'old', 'old', 1, 0);
			INSERT INTO expense_transactions (
				expense_month_id, expense_id, booked_at, original_description,
				description, original_amount, amount, category, type, source_order,
				created_at, last_modified
			) VALUES (5, 42, '2026-06-01', 'Old bank value', 'Edited old value',
				90, 12, 'Software', 'Personal', 0, 'old', 'edited');
		`);
	}

	storedSnapshot() {
		return {
			months: this.database.query("SELECT * FROM expense_months").all(),
			transactions: this.database
				.query("SELECT * FROM expense_transactions")
				.all(),
		};
	}

	close() {
		this.database.close();
	}
}

const stores: SqliteImportPersistence[] = [];
afterEach(() => {
	for (const store of stores.splice(0)) store.close();
});
function createStore() {
	const store = new SqliteImportPersistence();
	stores.push(store);
	return store;
}
describe("expense history import", () => {
	test("previews and imports a new month", async () => {
		const store = createStore();
		const preview = await previewExpenseHistoryImport(request(), store);
		expect(preview).toEqual({
			months: ["2026-06"],
			debitCount: 1,
			skippedCreditCount: 1,
			skippedCredits: [
				{
					rowNumber: 5,
					bookedAt: "2026-06-07",
					description: "Synthetic credit",
					amount: 10,
				},
			],
			totalDebitAmount: 42.5,
			warnings: [],
			replacementRequired: false,
			replacementMonths: [],
		});
		const result = await commitExpenseHistoryImport(request(), store);
		expect(result.replacedExistingMonths).toEqual([]);
		expect(store.storedSnapshot().transactions).toHaveLength(1);
	});

	test("imports a Finanzassistent workbook with its translated category", async () => {
		const store = createStore();
		const diningRequest = workbookRequest([
			{
				date: "2026-07-17",
				description: "Synthetic restaurant",
				amount: -25,
				category: "Gastronomie",
			},
		]);
		const preview = await previewExpenseHistoryImport(diningRequest, store);
		expect(preview).toMatchObject({
			months: ["2026-07"],
			debitCount: 1,
			totalDebitAmount: 25,
		});
		await commitExpenseHistoryImport(diningRequest, store);
		expect(
			store.database
				.query("SELECT description, amount, category FROM expense_transactions")
				.get(),
		).toEqual({
			description: "Synthetic restaurant",
			amount: 25,
			category: "Dining",
		});
	});

	test("rejects an unacknowledged replacement without changing edits or associations", async () => {
		const store = createStore();
		store.seedEditedMonth();
		const before = store.storedSnapshot();
		expect(commitExpenseHistoryImport(request(), store)).rejects.toBeInstanceOf(
			ExpenseHistoryReplacementRequiredError,
		);
		expect(store.storedSnapshot()).toEqual(before);
	});

	test("acknowledged replacement atomically removes the old dataset", async () => {
		const store = createStore();
		store.seedEditedMonth();
		const result = await commitExpenseHistoryImport(request(true), store);
		const stored = store.storedSnapshot();
		expect(result.replacedExistingMonths).toEqual(["2026-06"]);
		expect(stored.months).toHaveLength(1);
		expect(stored.transactions).toHaveLength(1);
		expect(stored.transactions[0]).toMatchObject({
			expense_id: null,
			original_description: "Synthetic replacement",
			description: "Synthetic replacement",
			original_amount: 42.5,
			amount: 42.5,
		});
	});

	test("previews and atomically replaces every existing month in a multi-month workbook", async () => {
		const store = createStore();
		store.seedEditedMonth();
		const multiMonthRequest = workbookRequest(
			[
				{
					date: "2026-06-03",
					description: "June replacement",
					amount: -21,
				},
				{
					date: "2026-07-02",
					description: "July import",
					amount: -31,
				},
			],
			false,
			"multi.xlsx",
		);
		const preview = await previewExpenseHistoryImport(multiMonthRequest, store);
		expect(preview).toMatchObject({
			months: ["2026-06", "2026-07"],
			debitCount: 2,
			totalDebitAmount: 52,
			replacementRequired: true,
			replacementMonths: ["2026-06"],
		});
		expect(
			commitExpenseHistoryImport(multiMonthRequest, store),
		).rejects.toBeInstanceOf(ExpenseHistoryReplacementRequiredError);

		const result = await commitExpenseHistoryImport(
			{ ...multiMonthRequest, replaceExistingMonths: true },
			store,
		);
		expect(result.replacedExistingMonths).toEqual(["2026-06"]);
		expect(
			store.database
				.query(
					`SELECT month, description FROM expense_months
					JOIN expense_transactions ON expense_months.id = expense_month_id
					ORDER BY month`,
				)
				.all(),
		).toEqual([
			{ month: "2026-06", description: "June replacement" },
			{ month: "2026-07", description: "July import" },
		]);
	});

	test("rolls back a failed replacement and preserves the old dataset", async () => {
		const store = createStore();
		store.seedEditedMonth();
		const before = store.storedSnapshot();
		store.failAfterMonthInsert = true;
		expect(commitExpenseHistoryImport(request(true), store)).rejects.toThrow(
			"Synthetic write failure",
		);
		expect(store.storedSnapshot()).toEqual(before);
	});

	test("does not pass raw workbook data to persistence or write it to logs", async () => {
		let persisted: ExpenseHistoryImportDataset | undefined;
		const persistence: ExpenseHistoryImportPersistence = {
			monthExists: async () => false,
			writeMonthsAtomically: async (datasets) => {
				persisted = datasets[0];
			},
		};
		const log = spyOn(console, "log").mockImplementation(() => undefined);
		const error = spyOn(console, "error").mockImplementation(() => undefined);
		const warn = spyOn(console, "warn").mockImplementation(() => undefined);
		const info = spyOn(console, "info").mockImplementation(() => undefined);
		const debug = spyOn(console, "debug").mockImplementation(() => undefined);
		try {
			const source = request();
			await commitExpenseHistoryImport(source, persistence);
			expect(JSON.stringify(persisted)).not.toContain(source.workbookBase64);
			expect(persisted?.sourceFilename).toBe("synthetic.xlsx");
			expect(log).not.toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
			expect(warn).not.toHaveBeenCalled();
			expect(info).not.toHaveBeenCalled();
			expect(debug).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
			error.mockRestore();
			warn.mockRestore();
			info.mockRestore();
			debug.mockRestore();
		}
	});

	test("keeps multi-month totals coherent through review, deletion, and replacement", async () => {
		const store = createStore();
		await commitExpenseHistoryImport(request(), store);
		await commitExpenseHistoryImport(
			workbookRequest([
				{
					date: "2026-05-03",
					description: "Synthetic other",
					amount: -18,
				},
			]),
			store,
		);
		store.database.exec(`
			INSERT INTO expenses (
				id, created_at, last_modified, name, category, type, rate,
				original_price, original_currency
			) VALUES (42, 'now', 'now', 'Synthetic recurring', 'Software',
				'Personal', 'Monthly', 30, 'CHF');
			UPDATE expense_transactions
			SET expense_id = 42, description = 'Reviewed recurring', amount = 30,
				category = 'Software', type = 'Personal'
			WHERE booked_at = '2026-06-03';
		`);
		const summaryInput = () => ({
			importedMonths: store.database
				.query("SELECT id FROM expense_months ORDER BY month")
				.all() as { id: number }[],
			configuredExpenses: store.database
				.query(
					"SELECT id AS expenseId, original_price AS monthlyAmount FROM expenses",
				)
				.all() as { expenseId: number; monthlyAmount: number }[],
			transactions: store.database
				.query(
					"SELECT expense_month_id AS expenseMonthId, expense_id AS expenseId, amount FROM expense_transactions",
				)
				.all() as {
				expenseMonthId: number;
				expenseId: number | null;
				amount: number;
			}[],
		});
		const reviewed = calculateExpenseHistorySummary(summaryInput());
		expect(reviewed.observedMonthlyAverage).toBe(24);
		expect(reviewed.other?.monthlyAverage).toBe(9);

		store.database.query("DELETE FROM expenses WHERE id = 42").run();
		const deleted = calculateExpenseHistorySummary(summaryInput());
		expect(deleted.observedMonthlyAverage).toBe(
			reviewed.observedMonthlyAverage,
		);
		expect(deleted.other?.monthlyAverage).toBe(24);

		await commitExpenseHistoryImport(request(true), store);
		const months = store.database
			.query(
				`SELECT month, count(transaction_row.id) AS transactionCount
				FROM expense_months month_row
				LEFT JOIN expense_transactions transaction_row
					ON transaction_row.expense_month_id = month_row.id
				GROUP BY month_row.id ORDER BY month`,
			)
			.all();
		expect(months).toEqual([
			{ month: "2026-05", transactionCount: 1 },
			{ month: "2026-06", transactionCount: 1 },
		]);
		expect(
			store.database
				.query(
					"SELECT description, amount, expense_id FROM expense_transactions WHERE booked_at = '2026-06-03'",
				)
				.get(),
		).toEqual({
			description: "Synthetic replacement",
			amount: 42.5,
			expense_id: null,
		});
	});
});
