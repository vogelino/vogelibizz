import { relations } from "drizzle-orm";
import { date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { projectsToQuotes } from "./projectsToQuotesDbSchema";

export const quotes = pgTable("quotes", {
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

export const quotesRelations = relations(quotes, ({ many }) => ({
	projectsToQuotes: many(projectsToQuotes),
}));
