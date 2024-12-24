import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectsToClients } from "./projectsToClientsDbSchema";

export const clients = pgTable("clients", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	legalName: text("legal_name"),
	addressLine1: text("address_line_1"),
	addressLine2: text("address_line_2"),
	addressLine3: text("address_line_3"),
	taxId: text("tax_id"),
	svgLogoString: text("svg_logo_string"),
	created_at: timestamp("created_at", { mode: "string" })
		.defaultNow()
		.notNull(),
	last_modified: timestamp("last_modified", { mode: "string" })
		.defaultNow()
		.notNull(),
});

const clientPureSchema = createSelectSchema(clients);
export const clientSelectSchema = clientPureSchema.merge(
	z.object({
		projects: z.object({ id: z.number(), name: z.string() }).array().optional(),
	}),
);
export type ClientType = z.infer<typeof clientSelectSchema>;

export const clientInsertSchema = clientSelectSchema
	.partial()
	.merge(z.object({ name: z.string() }));
export type ClientInsertType = z.infer<typeof clientInsertSchema>;

export const clientEditSchema = clientInsertSchema
	.partial()
	.omit({
		created_at: true,
		last_modified: true,
	})
	.merge(
		z
			.object({
				last_modified: z
					.string()
					.optional()
					.default(() => new Date().toISOString()),
			})
			.partial(),
	)
	.merge(z.object({ id: z.number() }));
export type ClientEditType = z.infer<typeof clientEditSchema>;

export const clientsRelations = relations(clients, ({ many }) => ({
	projectsToClients: many(projectsToClients, { relationName: "projects" }),
}));
