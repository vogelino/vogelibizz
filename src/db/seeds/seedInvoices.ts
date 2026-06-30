import { inArray } from "drizzle-orm";
import type db from "@/db";
import { clients, invoices as schema } from "../schema";
import invoicesSeedData from "./data/invoicesSeedData";

export async function seedInvoices(db: db) {
	const clientNames = Array.from(
		new Set(invoicesSeedData.map((invoice) => invoice.clientName)),
	);
	const seededClients = await db.query.clients.findMany({
		where: inArray(clients.name, clientNames),
	});
	await db.insert(schema).values(
		invoicesSeedData.map(({ clientName, ...invoice }) => ({
			...invoice,
			clientId:
				seededClients.find((client) => client.name === clientName)?.id ?? null,
		})),
	);
}
