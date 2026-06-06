import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { projects } from "./projectsDbSchema";
import { quotes } from "./quotesDbSchema";

export const projectsToQuotes = sqliteTable(
	"projects_to_quotes",
	{
		projectId: integer("project_id").references(() => projects.id, {
			onDelete: "cascade",
		}),
		quoteId: integer("quote_id").references(() => quotes.id, {
			onDelete: "cascade",
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.projectId, t.quoteId] }),
	}),
);

export const projectsToQuotesRelations = relations(
	projectsToQuotes,
	({ one }) => ({
		project: one(projects, {
			fields: [projectsToQuotes.projectId],
			references: [projects.id],
			relationName: "projectToQuote",
		}),
		quote: one(quotes, {
			fields: [projectsToQuotes.quoteId],
			references: [quotes.id],
			relationName: "quoteToProject",
		}),
	}),
);
