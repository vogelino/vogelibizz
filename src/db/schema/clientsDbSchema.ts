import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectsToClients } from "./projectsToClientsDbSchema";

export const clients = pgTable("clients", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	created_at: timestamp("created_at", { mode: "string" })
		.defaultNow()
		.notNull(),
	last_modified: timestamp("last_modified", { mode: "string" })
		.defaultNow()
		.notNull(),
});

export type ClientType = typeof clients.$inferSelect;
export type ClientInsertType = typeof clients.$inferInsert;

export const clientSelectSchema = createSelectSchema(clients);
export const clientInsertSchema = createInsertSchema(clients);
export const clientEditSchema = clientSelectSchema
	.omit({
		created_at: true,
		last_modified: true,
	})
	.merge(
		z.object({
			last_modified: z
				.string()
				.optional()
				.default(() => new Date().toISOString()),
		}),
	);
export type ClientEditType = z.infer<typeof clientEditSchema>;

export const clientsRelations = relations(clients, ({ many }) => ({
	projectsToClients: many(projectsToClients),
}));
