import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getNowInUTC } from "@/utility/timeUtil";
import { clients } from "./clientsDbSchema";
import { currencyEnum } from "./currenciesDbSchema";
import { projectsToInvoices } from "./projectsToInvoicesDbSchema";

const invoiceLanguageEnumValues = ["en-US", "es-CL", "fr-CH", "de-DE"] as const;

export const invoiceLanguageEnum = {
	enumValues: invoiceLanguageEnumValues,
};

export const invoiceLineItemSchema = z.object({
	description: z.string().min(1),
	hoursCount: z.number().nonnegative(),
});
export type InvoiceLineItemType = z.infer<typeof invoiceLineItemSchema>;

const invoiceProjectSchema = z.object({
	id: z.number(),
	name: z.string(),
	hourlyRate: z.number().nullable().optional(),
});

const invoiceClientSchema = z.object({
	id: z.number(),
	name: z.string(),
	clientNumber: z.string().nullable().optional(),
	language: z.string().nullable().optional(),
	legalName: z.string().nullable().optional(),
	addressLine1: z.string().nullable().optional(),
	addressLine2: z.string().nullable().optional(),
	addressLine3: z.string().nullable().optional(),
	taxId: z.string().nullable().optional(),
	svgLogoString: z.string().nullable().optional(),
});

export const invoices = sqliteTable("invoices", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	created_at: text("created_at")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	last_modified: text("last_modified")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	date: text("date")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	name: text("name").notNull().unique(),
	clientId: integer("client_id").references(() => clients.id, {
		onDelete: "set null",
	}),
	invoiceNumber: integer("invoice_number").notNull().default(1),
	clientNumber: text("client_number").notNull().default("0001"),
	subject: text("subject").notNull().default(""),
	introduction: text("introduction").notNull().default(""),
	footNote: text("foot_note").notNull().default(""),
	currency: text("currency", {
		enum: currencyEnum.enumValues,
	})
		.notNull()
		.default("EUR"),
	language: text("language", {
		enum: invoiceLanguageEnumValues,
	})
		.notNull()
		.default("de-DE"),
	hourlyRate: integer("hourly_rate").notNull().default(50),
	invoiceLocation: text("invoice_location").notNull().default("Santiago"),
	rows: text("rows", { mode: "json" })
		.$type<InvoiceLineItemType[]>()
		.$defaultFn(() => [])
		.notNull(),
});

const invoicePureSchema = createSelectSchema(invoices);
export const invoiceSelectSchema = invoicePureSchema.extend({
	rows: invoiceLineItemSchema.array(),
	projects: invoiceProjectSchema.array().optional(),
	clients: invoiceClientSchema.array().optional(),
});
export type InvoiceType = z.infer<typeof invoiceSelectSchema>;

export const invoiceInsertSchema = invoiceSelectSchema
	.omit({
		created_at: true,
		last_modified: true,
		projects: true,
		clients: true,
	})
	.partial()
	.extend({
		name: z.string(),
		rows: invoiceLineItemSchema.array().default([]),
	});
export type InvoiceInsertType = z.infer<typeof invoiceInsertSchema>;

export const invoiceEditSchema = invoiceSelectSchema
	.omit({
		created_at: true,
		last_modified: true,
		projects: true,
		clients: true,
	})
	.partial()
	.extend(
		z
			.object({
				last_modified: z
					.string()
					.optional()
					.default(() => getNowInUTC()),
			})
			.partial().shape,
	)
	.extend({
		id: z.number(),
	});
export type InvoiceEditType = z.infer<typeof invoiceEditSchema>;

export const invoicesRelations = relations(invoices, ({ many }) => ({
	projectsToInvoices: many(projectsToInvoices, { relationName: "projects" }),
}));
