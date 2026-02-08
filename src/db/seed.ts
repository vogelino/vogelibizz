import type { getTableName as GetTableName, Table } from "drizzle-orm";
import type { db as DbType } from "@/db";
import { loadDotEnv } from "@/utility/loadDotEnv";

async function main() {
	loadDotEnv();

	const [
		{ getTableName, sql },
		{ migrate },
		{ connection, db },
		schema,
		env,
		config,
		seeds,
	] = await Promise.all([
		import("drizzle-orm"),
		import("drizzle-orm/postgres-js/migrator"),
		import("@/db"),
		import("@/db/schema"),
		import("@/env"),
		import("$/drizzle.config"),
		import("./seeds"),
	]);

	if (!env.default.server.POSTGRES_SEEDING) {
		throw new Error('You must set DB_SEEDING to "true" when running seeds');
	}

	const tableCheck = await db.execute(
		sql<{ exists: string | null }>`
			select to_regclass('public.expenses') as exists
		`,
	);
	const hasExpensesTable = Boolean(tableCheck[0]?.exists);

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

	await db.execute(
		sql`ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "target_currency" "currency" DEFAULT 'CLP' NOT NULL`,
	);

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

	await connection.end();
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
