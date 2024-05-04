import type db from "@/db";
import { invoices as schema } from "../schema";
import invoicesSeedData from "./data/invoicesSeedData";

export async function seedInvoices(db: db) {
	await db.insert(schema).values(invoicesSeedData);
}
