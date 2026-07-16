import { Database } from "bun:sqlite";
import { afterEach, describe, expect, spyOn, test } from "bun:test";
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
];
const migrationSql = (
	await Promise.all(
		migrationNames.map((name) =>
			Bun.file(new URL(name, migrationDirectory)).text(),
		),
	)
).join("\n");
const csv = `IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
CH00;03.06.2026;Synthetic replacement;-42.50;1200.00;04.06.2026
CH00;07.06.2026;Synthetic credit;10.00;1210.00;07.06.2026`;

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

	async writeMonthAtomically(
		dataset: ExpenseHistoryImportDataset,
		replaceExistingMonth: boolean,
	) {
		const write = this.database.transaction(() => {
			if (replaceExistingMonth) {
				this.database
					.query("DELETE FROM expense_months WHERE month = ?")
					.run(dataset.month);
			}
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
			if (this.failAfterMonthInsert) throw new Error("Synthetic write failure");
			for (const debit of dataset.debits) {
				this.database
					.query(
						`INSERT INTO expense_transactions (
							expense_month_id, booked_at, value_date,
							original_description, description, original_amount, amount,
							source_order, created_at, last_modified
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					)
					.run(
						month.id,
						debit.bookedAt,
						debit.valueDate,
						debit.description,
						debit.description,
						debit.amount,
						debit.amount,
						debit.sourceOrder,
						"2026-07-16T12:00:00.000Z",
						"2026-07-16T12:00:00.000Z",
					);
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
			) VALUES (5, '2026-06', 'old.csv', 'old', 'old', 1, 0);
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
function request(
	replaceExistingMonth = false,
): ExpenseHistoryImportCommitRequest {
	return {
		csv,
		sourceFilename: "C:\\private\\synthetic.csv",
		replaceExistingMonth,
	};
}

describe("expense history import", () => {
	test("previews and imports a new month", async () => {
		const store = createStore();
		const preview = await previewExpenseHistoryImport(request(), store);
		expect(preview).toEqual({
			month: "2026-06",
			debitCount: 1,
			skippedCreditCount: 1,
			totalDebitAmount: 42.5,
			warnings: [
				"1 positive credit row was skipped; only negative debits will be imported.",
			],
			replacementRequired: false,
		});
		const result = await commitExpenseHistoryImport(request(), store);
		expect(result.replacedExistingMonth).toBe(false);
		expect(store.storedSnapshot().transactions).toHaveLength(1);
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
		expect(result.replacedExistingMonth).toBe(true);
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

	test("does not pass raw CSV to persistence or write it to logs", async () => {
		let persisted: ExpenseHistoryImportDataset | undefined;
		const persistence: ExpenseHistoryImportPersistence = {
			monthExists: async () => false,
			writeMonthAtomically: async (dataset) => {
				persisted = dataset;
			},
		};
		const log = spyOn(console, "log").mockImplementation(() => undefined);
		const error = spyOn(console, "error").mockImplementation(() => undefined);
		try {
			await commitExpenseHistoryImport(request(), persistence);
			expect(JSON.stringify(persisted)).not.toContain(csv);
			expect(persisted?.sourceFilename).toBe("synthetic.csv");
			expect(log).not.toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
			error.mockRestore();
		}
	});
});
