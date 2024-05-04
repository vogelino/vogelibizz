import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
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

export const clientsRelations = relations(clients, ({ many }) => ({
	projectsToClients: many(projectsToClients),
}));
