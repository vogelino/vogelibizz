import { relations } from "drizzle-orm";
import { date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { projectsToInvoices } from "./projectsToInvoicesDbSchema";
import { getNowInUTC } from "@/utility/timeUtil";

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
