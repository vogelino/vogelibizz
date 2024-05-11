import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectsToClients } from "./projectsToClientsDbSchema";
import { projectsToInvoices } from "./projectsToInvoicesDbSchema";
import { projectsToQuotes } from "./projectsToQuotesDbSchema";

export const projectStatusEnum = pgEnum("project_status", [
  "todo",
  "active",
  "paused",
  "done",
  "cancelled",
  "negotiating",
  "waiting_for_feedback",
]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  last_modified: timestamp("last_modified", { mode: "string" })
    .defaultNow()
    .notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("todo").notNull(),
  content: text("content").default(""),
});

export type ProjectType = typeof projects.$inferSelect;
export type ProjectInsertType = typeof projects.$inferInsert;

export const projectSelectSchema = createSelectSchema(projects);
export const projectInsertSchema = createInsertSchema(projects);
export const projectEditSchema = projectSelectSchema
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
    })
  );
export type ProjectEditType = z.infer<typeof projectEditSchema>;

export const projectsRelations = relations(projects, ({ many }) => ({
  projectsToClients: many(projectsToClients),
  projectsToInvoices: many(projectsToInvoices),
  projectsToQuotes: many(projectsToQuotes),
}));
