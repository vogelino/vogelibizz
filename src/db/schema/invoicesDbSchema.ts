import { relations } from "drizzle-orm";
import { date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { projectsToInvoices } from "./projectsToInvoicesDbSchema";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  last_modified: timestamp("last_modified", { mode: "string" })
    .defaultNow()
    .notNull(),
  date: date("date", { mode: "string" }).notNull().defaultNow(),
  name: text("name").notNull().unique(),
});

export const invoicesRelations = relations(invoices, ({ many }) => ({
  projectsToInvoices: many(projectsToInvoices),
}));
