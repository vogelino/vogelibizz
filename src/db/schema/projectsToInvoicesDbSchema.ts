import { relations } from "drizzle-orm";
import { pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { invoices } from "./invoicesDbSchema";
import { projects } from "./projectsDbSchema";

export const projectsToInvoices = pgTable(
	"projects_to_invoices",
	{
		projectId: serial("project_id").references(() => projects.id, {
			onDelete: "cascade",
		}),
		invoiceId: serial("invoice_id").references(() => invoices.id, {
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
