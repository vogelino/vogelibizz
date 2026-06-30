import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getNowInUTC } from "@/utility/timeUtil";
import { projectsToClients } from "./projectsToClientsDbSchema";
import { projectsToInvoices } from "./projectsToInvoicesDbSchema";
import { projectsToQuotes } from "./projectsToQuotesDbSchema";

const projectStatusEnumValues = [
	"todo",
	"active",
	"paused",
	"done",
	"cancelled",
	"negotiating",
	"waiting_for_feedback",
] as const;

export const projectStatusEnum = {
	enumValues: projectStatusEnumValues,
};

export const projects = sqliteTable("projects", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	created_at: text("created_at")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	last_modified: text("last_modified")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	description: text("description"),
	hourlyRate: integer("hourly_rate").notNull().default(50),
	status: text("status", { enum: projectStatusEnumValues })
		.default("todo")
		.notNull(),
	content: text("content").default(""),
});

const projectPureSchema = createSelectSchema(projects);
export const projectSelectSchema = projectPureSchema.extend({
	clients: z.object({ id: z.number(), name: z.string() }).array().optional(),
});
export type ProjectType = z.infer<typeof projectSelectSchema>;

export const projectInsertSchema = projectSelectSchema.partial().extend({
	name: z.string(),
});
export type ProjectInsertType = z.infer<typeof projectInsertSchema>;

export const projectEditSchema = projectSelectSchema
	.omit({
		created_at: true,
		last_modified: true,
	})
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
export type ProjectEditType = z.infer<typeof projectEditSchema>;

export const projectsRelations = relations(projects, ({ many }) => ({
	projectsToClients: many(projectsToClients, { relationName: "clients" }),
	projectsToInvoices: many(projectsToInvoices, { relationName: "invoices" }),
	projectsToQuotes: many(projectsToQuotes, { relationName: "quotes" }),
}));
