import db from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import projectsSeedData from "./data/projectsSeedData";

export async function seedProjects(db: db) {
	await Promise.all(projectsSeedData.map(insertProject));
}

async function insertProject(project: (typeof projectsSeedData)[0]) {
	const clientNames = project.clients.map((c) => c.name);
	const invoicesNames = project.invoices.map((i) => i.name);
	const quotesNames = project.quotes.map((q) => q.name);

	const [clients, invoices, quotes] = await Promise.all([
		await db.query.clients.findMany({
			where: inArray(schema.clients.name, clientNames),
		}),
		await db.query.invoices.findMany({
			where: inArray(schema.invoices.name, invoicesNames),
		}),
		await db.query.quotes.findMany({
			where: inArray(schema.quotes.name, quotesNames),
		}),
	]);

	await db.insert(schema.projects).values(project);
	const insertedProject = await db.query.projects.findFirst({
		where: eq(schema.projects.name, project.name),
	});

	if (!insertedProject) {
		throw new Error(
			`Could not find freshly insterted project with name "${project.name}"`,
		);
	}

	await Promise.all([
		db.insert(schema.projectsToClients).values(
			clients.map((c) => ({
				projectId: insertedProject.id,
				clientId: c.id,
			})),
		),
		db.insert(schema.projectsToInvoices).values(
			invoices.map((i) => ({
				projectId: insertedProject.id,
				invoiceId: i.id,
			})),
		),
		db.insert(schema.projectsToQuotes).values(
			quotes.map((q) => ({
				projectId: insertedProject.id,
				quoteId: q.id,
			})),
		),
	]);
}
