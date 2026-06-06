import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { invoices } from "./invoicesDbSchema";
import { projects } from "./projectsDbSchema";

export const projectsToInvoices = sqliteTable(
	"projects_to_invoices",
	{
		projectId: integer("project_id").references(() => projects.id, {
			onDelete: "cascade",
		}),
		invoiceId: integer("invoice_id").references(() => invoices.id, {
			onDelete: "cascade",
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.invoiceId] }),
	}),
);

export const projectsToInvoicesRelations = relations(
	projectsToInvoices,
	({ one }) => ({
		project: one(projects, {
			fields: [projectsToInvoices.projectId],
			references: [projects.id],
			relationName: "projetToInvoice",
		}),
		invoice: one(invoices, {
			fields: [projectsToInvoices.invoiceId],
			references: [invoices.id],
			relationName: "invoiceToProject",
		}),
	}),
);
