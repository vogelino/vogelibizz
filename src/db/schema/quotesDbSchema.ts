import { relations } from "drizzle-orm";
import { date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { projectsToQuotes } from "./projectsToQuotesDbSchema";
import { getNowInUTC } from "@/utility/timeUtil";

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at", { mode: "string" })
    .$defaultFn(() => getNowInUTC())
    .notNull(),
  last_modified: timestamp("last_modified", { mode: "string" })
    .$defaultFn(() => getNowInUTC())
    .notNull(),
  date: date("date", { mode: "string" }).notNull().defaultNow(),
  name: text("name").notNull().unique(),
});

export const quotesRelations = relations(quotes, ({ many }) => ({
  projectsToQuotes: many(projectsToQuotes, { relationName: "projects" }),
}));
