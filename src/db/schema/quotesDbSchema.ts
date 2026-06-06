import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getNowInUTC } from "@/utility/timeUtil";
import { projectsToQuotes } from "./projectsToQuotesDbSchema";

export const quotes = sqliteTable("quotes", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	created_at: text("created_at")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	last_modified: text("last_modified")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	date: text("date")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	name: text("name").notNull().unique(),
});

export const quotesRelations = relations(quotes, ({ many }) => ({
	projectsToQuotes: many(projectsToQuotes, { relationName: "projects" }),
}));
