import type { getTableName as GetTableName, Table } from "drizzle-orm";
import type { db as DbType } from "@/db";
import { loadDotEnv } from "@/utility/loadDotEnv";

async function main() {
	loadDotEnv();

	const [{ getTableName, sql }, { migrate }, { getDb }, schema, config, seeds] =
		await Promise.all([
			import("drizzle-orm"),
			import("drizzle-orm/d1/migrator"),
			import("@/db"),
			import("@/db/schema"),
			import("$/drizzle.config"),
			import("./seeds"),
		]);

	if (!(globalThis as { DB?: unknown }).DB) {
		throw new Error(
			"D1 binding not found on globalThis.DB. Run seeds via wrangler so the DB binding is available.",
		);
	}

	const db = getDb();
	const tableCheck = await db.all<{ name: string | null }>(
		sql`select name from sqlite_master where type = 'table' and name = 'expenses'`,
	);
	const hasExpensesTable = Boolean(tableCheck[0]?.name);

	if (!hasExpensesTable) {
		await migrate(db, { migrationsFolder: config.default.out! });
	}

	for (const table of [
		schema.projectsToClients,
		schema.projectsToInvoices,
		schema.projectsToQuotes,
		schema.clients,
		schema.expenses,
		schema.invoices,
		schema.quotes,
		schema.projects,
		schema.currencies,
		schema.settings,
	]) {
		await resetTable(db, table, getTableName);
	}

	console.log(`Seeding lookup tables:`);
	console.log(`- expenses`);
	console.log(`- clients`);
	console.log(`- invoices`);
	console.log(`- quotes`);
	console.log(`- currencies`);
	console.log(`- settings`);

	await Promise.all([
		seeds.seedExpenses(db),
		seeds.seedClients(db),
		seeds.seedInvoices(db),
		seeds.seedQuotes(db),
		seeds.seedCurrencies(db),
		seeds.seedSettings(db),
	]);

	console.log(`Seeding tables with relations:`);
	console.log(`- projects`);
	await seeds.seedProjects(db);
}

await main();

// –––––––––––––––––

async function resetTable(
	db: DbType,
	table: Table,
	getTableName: typeof GetTableName,
) {
	console.log(`Reseting table "${getTableName(table)}"`);
	try {
		return db.delete(table);
	} catch (error) {
		console.error(`Failed to reset table "${getTableName(table)}"`);
		throw error;
	} finally {
		console.log(`Table "${getTableName(table)}" was reset`);
	}
}
