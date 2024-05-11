import { relations } from "drizzle-orm";
import {
	doublePrecision,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { currencies, currencyEnum } from "./currenciesDbSchema";

export const expenseCategoryEnum = pgEnum("expense_category", [
	"Essentials",
	"Home",
	"Domain",
	"Health & Wellbeing",
	"Entertainment",
	"Charity",
	"Present",
	"Services",
	"Hardware",
	"Software",
	"Hobby",
	"Savings",
	"Transport",
	"Travel",
	"Administrative",
]);

export const expenseTypeEnum = pgEnum("expense_type", [
	"Personal",
	"Freelance",
]);

export const expenseRateEnum = pgEnum("expense_rate", [
	"Monthly",
	"Daily",
	"Hourly",
	"Weekly",
	"Yearly",
	"Quarterly",
	"Semester",
	"Bi-Weekly",
	"Bi-Monthly",
	"Bi-Yearly",
	"Tri-Yearly",
	"One-time",
]);

export const expenses = pgTable("expenses", {
	id: serial("id").primaryKey(),
	created_at: timestamp("created_at", { mode: "string" })
		.defaultNow()
		.notNull(),
	last_modified: timestamp("last_modified", { mode: "string" })
		.defaultNow()
		.notNull(),
	name: text("name").notNull().unique(),
	category: expenseCategoryEnum("category").notNull().default("Software"),
	type: expenseTypeEnum("type").notNull().default("Personal"),
	rate: expenseRateEnum("rate").notNull().default("Monthly"),
	originalPrice: doublePrecision("original_price").notNull().default(0.0),
	originalCurrency: currencyEnum("original_currency").notNull(),
});

export type ExpenseType = typeof expenses.$inferSelect;
export type ExpenseInsertType = typeof expenses.$inferInsert;

export const expenseSelectSchema = createSelectSchema(expenses);
export const expenseInsertSchema = createInsertSchema(expenses);
export const expenseEditSchema = expenseSelectSchema
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
		}),
	);
export type ExpenseEditType = z.infer<typeof expenseEditSchema>;

export const expenseWithMonthlyCLPPriceSchema = z
	.object({
		clpMonthlyPrice: z.number(),
	})
	.merge(expenseSelectSchema);

export type ExpenseWithMonthlyCLPPriceType = z.infer<
	typeof expenseWithMonthlyCLPPriceSchema
>;

export const expensesRelations = relations(expenses, ({ one }) => ({
	currency: one(currencies),
}));
