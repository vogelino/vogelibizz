import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";

const migrationDirectory = new URL("../migrations/d1/", import.meta.url);
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
const seedSql = await Bun.file(
	new URL("seed-full.sql", import.meta.url),
).text();

describe("local full expense-history seed", () => {
	test("idempotently seeds only the previous month with valid associations", () => {
		const database = new Database(":memory:");
		try {
			database.exec(migrationSql);
			database.exec(seedSql);
			database.exec(seedSql);
			const expectedPreviousMonth = database
				.query(
					"SELECT strftime('%Y-%m', 'now', 'start of month', '-1 month') AS month",
				)
				.get() as { month: string };
			const currentMonth = database
				.query("SELECT strftime('%Y-%m', 'now') AS month")
				.get() as { month: string };
			const months = database
				.query("SELECT month, imported_debit_count FROM expense_months")
				.all();
			expect(months).toEqual([
				{ month: expectedPreviousMonth.month, imported_debit_count: 4 },
			]);
			expect(
				database
					.query("SELECT id FROM expense_months WHERE month = ?")
					.get(currentMonth.month),
			).toBeNull();
			const counts = database
				.query(
					`SELECT count(*) AS total,
						sum(CASE WHEN expense_id IS NOT NULL THEN 1 ELSE 0 END) AS associated,
						sum(CASE WHEN expense_id IS NULL THEN 1 ELSE 0 END) AS other_count
					FROM expense_transactions`,
				)
				.get();
			expect(counts).toEqual({ total: 4, associated: 2, other_count: 2 });
			const invalidAssociations = database
				.query(
					`SELECT count(*) AS count
					FROM expense_transactions transaction_row
					LEFT JOIN expenses expense ON expense.id = transaction_row.expense_id
					WHERE transaction_row.expense_id IS NOT NULL AND expense.id IS NULL`,
				)
				.get() as { count: number };
			expect(invalidAssociations.count).toBe(0);
		} finally {
			database.close();
		}
	});
});
