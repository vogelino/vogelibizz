import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import {
	expenseMonthInsertSchema,
	expenseTransactionInsertSchema,
} from "@/db/schema";

const migrationDirectory = new URL("../migrations/d1/", import.meta.url);
const baseMigrationNames = [
	"0000_third_bullseye.sql",
	"0001_tranquil_tarot.sql",
	"0002_rare_golden_guardian.sql",
	"0003_swift_nitro.sql",
];
const baseMigrationSql = (
	await Promise.all(
		baseMigrationNames.map((name) =>
			Bun.file(new URL(name, migrationDirectory)).text(),
		),
	)
).join("\n");
const historyMigrationSql = await Bun.file(
	new URL("0004_abnormal_betty_brant.sql", migrationDirectory),
).text();
const performanceMigrationSql = await Bun.file(
	new URL("0005_cynical_hellcat.sql", migrationDirectory),
).text();
const timestamp = "2026-07-16T12:00:00.000Z";

function createMigratedDatabase() {
	const database = new Database(":memory:");
	database.exec("PRAGMA foreign_keys = ON");
	database.exec(baseMigrationSql);
	database
		.query(
			`INSERT INTO expenses (
				id, created_at, last_modified, name, category, type, rate,
				original_price, original_currency
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.run(
			42,
			timestamp,
			timestamp,
			"Existing recurring expense",
			"Software",
			"Personal",
			"Monthly",
			25.5,
			"CHF",
		);
	database.exec(historyMigrationSql);
	database.exec(performanceMigrationSql);
	return database;
}

function insertMonth(database: Database, month = "2026-06") {
	return database
		.query(
			`INSERT INTO expense_months (
				month, source_filename, imported_at, last_modified,
				imported_debit_count, skipped_credit_count
			) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
		)
		.get(month, "expenses.csv", timestamp, timestamp, 1, 0) as { id: number };
}

function insertTransaction(
	database: Database,
	{
		expenseMonthId,
		expenseId = 42,
		sourceOrder = 0,
	}: {
		expenseMonthId: number;
		expenseId?: number | null;
		sourceOrder?: number;
	},
) {
	database
		.query(
			`INSERT INTO expense_transactions (
				expense_month_id, expense_id, booked_at, value_date,
				original_description, description, original_amount, amount,
				category, type, source_order, created_at, last_modified
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.run(
			expenseMonthId,
			expenseId,
			"2026-06-05",
			null,
			"Immutable bank description",
			"Editable description",
			25.5,
			0,
			null,
			null,
			sourceOrder,
			timestamp,
			timestamp,
		);
}

describe("expense history migration constraints", () => {
	test("applies to a populated database and stores original and effective values independently", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, { expenseMonthId: month.id });

			const existingExpense = database
				.query("SELECT name FROM expenses WHERE id = 42")
				.get();
			const stored = database
				.query(
					`SELECT original_description, description, original_amount, amount
					FROM expense_transactions`,
				)
				.get();
			expect(existingExpense).toEqual({
				name: "Existing recurring expense",
			});
			expect(stored).toEqual({
				original_description: "Immutable bank description",
				description: "Editable description",
				original_amount: 25.5,
				amount: 0,
			});
		} finally {
			database.close();
		}
	});

	test("allows only one active dataset per calendar month", () => {
		const database = createMigratedDatabase();
		try {
			insertMonth(database);
			expect(() => insertMonth(database)).toThrow();
			expect(() => insertMonth(database, "2026-13")).toThrow();
		} finally {
			database.close();
		}
	});

	test("cascades month deletion to its transactions", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, { expenseMonthId: month.id });

			database.query("DELETE FROM expense_months WHERE id = ?").run(month.id);

			const count = database
				.query("SELECT count(*) AS count FROM expense_transactions")
				.get() as { count: number };
			expect(count.count).toBe(0);
		} finally {
			database.close();
		}
	});

	test("sets associations to null when a recurring expense is deleted", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, { expenseMonthId: month.id });

			database.query("DELETE FROM expenses WHERE id = 42").run();

			const transaction = database
				.query("SELECT expense_id FROM expense_transactions")
				.get();
			expect(transaction).toEqual({ expense_id: null });
		} finally {
			database.close();
		}
	});

	test("association snapshots classifications once and detachment preserves transaction edits", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, {
				expenseMonthId: month.id,
				expenseId: null,
			});
			database
				.query(`UPDATE expense_transactions SET expense_id = 42,
				category = (SELECT category FROM expenses WHERE id = 42),
				type = (SELECT type FROM expenses WHERE id = 42),
				description = 'Historical edit', amount = 0 WHERE expense_month_id = ?`)
				.run(month.id);
			database
				.query(
					"UPDATE expenses SET category = 'Home', type = 'Freelance' WHERE id = 42",
				)
				.run();
			database
				.query(
					"UPDATE expense_transactions SET expense_id = NULL WHERE expense_month_id = ?",
				)
				.run(month.id);
			expect(
				database
					.query(
						"SELECT expense_id, category, type, description, amount FROM expense_transactions",
					)
					.get(),
			).toEqual({
				expense_id: null,
				category: "Software",
				type: "Personal",
				description: "Historical edit",
				amount: 0,
			});
		} finally {
			database.close();
		}
	});

	test("atomic create-and-associate token claim creates nothing after a concurrent update", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, {
				expenseMonthId: month.id,
				expenseId: null,
			});
			database
				.query(
					"UPDATE expense_transactions SET last_modified = 'concurrent' WHERE expense_month_id = ?",
				)
				.run(month.id);
			database.exec("BEGIN");
			try {
				database
					.query(
						"UPDATE expense_transactions SET last_modified = 'claimed' WHERE expense_month_id = ? AND last_modified = ? AND expense_id IS NULL",
					)
					.run(month.id, timestamp);
				database
					.query(`INSERT INTO expenses (name, category, type, rate, original_price, original_currency, created_at, last_modified)
					SELECT 'Conditional expense', 'Software', 'Personal', 'Monthly', 0, 'CHF', ?, ?
					WHERE EXISTS (SELECT 1 FROM expense_transactions WHERE expense_month_id = ? AND last_modified = 'claimed')`)
					.run(timestamp, timestamp, month.id);
				database
					.query(`UPDATE expense_transactions SET expense_id = (SELECT id FROM expenses WHERE name = 'Conditional expense'), last_modified = 'final'
					WHERE expense_month_id = ? AND last_modified = 'claimed'`)
					.run(month.id);
				database.exec("COMMIT");
			} catch (error) {
				database.exec("ROLLBACK");
				throw error;
			}
			expect(
				database
					.query(
						"SELECT count(*) AS count FROM expenses WHERE name = 'Conditional expense'",
					)
					.get(),
			).toEqual({ count: 0 });
			expect(
				database
					.query("SELECT expense_id, last_modified FROM expense_transactions")
					.get(),
			).toEqual({ expense_id: null, last_modified: "concurrent" });
		} finally {
			database.close();
		}
	});

	test("enforces non-negative effective amounts and stable source order", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, { expenseMonthId: month.id });
			expect(() =>
				database
					.query(
						"UPDATE expense_transactions SET amount = -1 WHERE expense_month_id = ?",
					)
					.run(month.id),
			).toThrow();
			expect(() =>
				insertTransaction(database, {
					expenseMonthId: month.id,
					sourceOrder: 0,
				}),
			).toThrow();
		} finally {
			database.close();
		}
	});

	test("uses indexes for month, ordered transaction, and association lookups", () => {
		const database = createMigratedDatabase();
		try {
			const month = insertMonth(database);
			insertTransaction(database, { expenseMonthId: month.id });
			const monthPlan = database
				.query(`EXPLAIN QUERY PLAN
					SELECT transaction_row.id
					FROM expense_transactions transaction_row
					INNER JOIN expense_months month_row
						ON transaction_row.expense_month_id = month_row.id
					WHERE month_row.month = ?
					ORDER BY transaction_row.booked_at, transaction_row.source_order`)
				.all("2026-06") as { detail: string }[];
			const associationPlan = database
				.query(
					"EXPLAIN QUERY PLAN SELECT id FROM expense_transactions WHERE expense_id = ?",
				)
				.all(42) as { detail: string }[];

			expect(monthPlan.map(({ detail }) => detail).join("\n")).toContain(
				"expense_transactions_month_booked_order_idx",
			);
			expect(monthPlan.map(({ detail }) => detail).join("\n")).not.toContain(
				"TEMP B-TREE",
			);
			expect(associationPlan.map(({ detail }) => detail).join("\n")).toContain(
				"expense_transactions_expense_idx",
			);
		} finally {
			database.close();
		}
	});
});

describe("expense history validation schemas", () => {
	test("accepts nullable classification and distinct original and effective values", () => {
		const month = expenseMonthInsertSchema.parse({
			month: "2026-06",
			sourceFilename: "expenses.csv",
			importedDebitCount: 1,
		});
		const transaction = expenseTransactionInsertSchema.parse({
			expenseMonthId: 1,
			expenseId: null,
			bookedAt: "2026-06-05",
			valueDate: null,
			originalDescription: "Bank value",
			description: "Edited value",
			originalAmount: 20,
			amount: 0,
			category: null,
			type: null,
			sourceOrder: 0,
		});

		expect(month.skippedCreditCount).toBe(0);
		expect(transaction.originalAmount).toBe(20);
		expect(transaction.amount).toBe(0);
		expect(transaction.category).toBeNull();
		expect(transaction.type).toBeNull();
	});

	test("rejects malformed months, dates, descriptions, and amounts", () => {
		expect(() =>
			expenseMonthInsertSchema.parse({
				month: "2026-13",
				sourceFilename: "expenses.csv",
				importedDebitCount: 1,
			}),
		).toThrow();
		expect(() =>
			expenseTransactionInsertSchema.parse({
				expenseMonthId: 1,
				bookedAt: "not-a-date",
				originalDescription: " ",
				description: "Edited value",
				originalAmount: 0,
				amount: -1,
				sourceOrder: -1,
			}),
		).toThrow();
	});
});
