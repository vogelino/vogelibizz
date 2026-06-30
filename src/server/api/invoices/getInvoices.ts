import { eq } from "drizzle-orm";
import db from "@/db";
import {
	clients,
	type InvoiceType,
	invoices,
	projects,
	projectsToClients,
	projectsToInvoices,
} from "@/db/schema";

export async function getInvoices(): Promise<InvoiceType[]> {
	const invoicesWithRelations = await db
		.select()
		.from(invoices)
		.leftJoin(projectsToInvoices, eq(invoices.id, projectsToInvoices.invoiceId))
		.leftJoin(projects, eq(projectsToInvoices.projectId, projects.id))
		.leftJoin(projectsToClients, eq(projects.id, projectsToClients.projectId))
		.leftJoin(clients, eq(projectsToClients.clientId, clients.id));

	const invoiceMap = new Map<number, InvoiceType>();

	for (const row of invoicesWithRelations) {
		const existingInvoice = invoiceMap.get(row.invoices.id);
		const nextProjects = existingInvoice?.projects ?? [];
		const nextClients = existingInvoice?.clients ?? [];
		const nextInvoice: InvoiceType = {
			...(existingInvoice ?? row.invoices),
			projects: row.projects
				? appendUnique(nextProjects, {
						id: row.projects.id,
						name: row.projects.name,
					})
				: nextProjects,
			clients: row.clients
				? appendUnique(nextClients, {
						id: row.clients.id,
						name: row.clients.name,
						legalName: row.clients.legalName,
						addressLine1: row.clients.addressLine1,
						addressLine2: row.clients.addressLine2,
						addressLine3: row.clients.addressLine3,
						taxId: row.clients.taxId,
					})
				: nextClients,
		};
		invoiceMap.set(row.invoices.id, nextInvoice);
	}

	return Array.from(invoiceMap.values());
}

function appendUnique<T extends { id: number }>(items: T[], item: T): T[] {
	return items.some((existingItem) => existingItem.id === item.id)
		? items
		: [...items, item];
}
