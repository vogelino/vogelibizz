import { getTableName, type Table } from "drizzle-orm";
import { connection, db } from "@/db";
import * as schema from "@/db/schema";
import env from "@/env";
import * as seeds from "./seeds";

if (!env.server.POSTGRES_SEEDING) {
	throw new Error('You must set DB_SEEDING to "true" when running seeds');
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
	await resetTable(db, table);
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

await connection.end();

// –––––––––––––––––

async function resetTable(db: db, table: Table) {
	console.log(`Reseting table "${getTableName(table)}"`);
	try {
		return db.delete(table); // clear tables without truncating / resetting ids
	} catch (error) {
		console.error(`Failed to reset table "${getTableName(table)}"`);
		throw error;
	} finally {
		console.log(`Table "${getTableName(table)}" was reset`);
	}
}
