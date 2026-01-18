import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { getNowInUTC } from "@/utility/timeUtil";
import { projectsToInvoices } from "./projectsToInvoicesDbSchema";

export const invoices = pgTable("invoices", {
	id: serial("id").primaryKey(),
	created_at: timestamp("created_at", { mode: "string" })
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	last_modified: timestamp("last_modified", { mode: "string" })
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	date: timestamp("date", { mode: "string" }).defaultNow().notNull(),
	name: text("name").notNull().unique(),
});

export const invoicesRelations = relations(invoices, ({ many }) => ({
	projectsToInvoices: many(projectsToInvoices, { relationName: "projects" }),
}));
