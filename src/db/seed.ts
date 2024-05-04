import { connection, db } from "@/db";
import * as schema from "@/db/schema";
import env from "@/env";
import { getTableName, sql, type Table } from "drizzle-orm";
import type { PgEnum } from "drizzle-orm/pg-core";
import * as seeds from "./seeds";

if (!env.DB_SEEDING) {
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
]) {
  await resetTable(db, table);
}

console.log(`Seeding lookup tables:`);
console.log(`- expenses`);
console.log(`- clients`);
console.log(`- invoices`);
console.log(`- quotes`);

await Promise.all([
  seeds.seedExpenses(db),
  seeds.seedClients(db),
  seeds.seedInvoices(db),
  seeds.seedQuotes(db),
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

async function resetEnum(db: db, enumerable: PgEnum<[string, ...string[]]>) {
  console.log(`Reseting enum "${enumerable.enumName}"`);
  try {
    return db.execute(sql.raw(`DROP TYPE IF EXISTS ${enumerable.enumName}`));
  } catch (error) {
    console.error(`Failed to reset enum "${enumerable.enumName}"`);
    throw error;
  } finally {
    console.log(`Table "${enumerable.enumName}" was reset`);
  }
}
