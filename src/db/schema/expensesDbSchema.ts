import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getNowInUTC } from "@/utility/timeUtil";
import { currencies, currencyEnum } from "./currenciesDbSchema";

const expenseCategoryEnumValues = [
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
] as const;

export const expenseCategoryEnum = {
	enumValues: expenseCategoryEnumValues,
};

const expenseTypeEnumValues = ["Personal", "Freelance"] as const;

export const expenseTypeEnum = {
	enumValues: expenseTypeEnumValues,
};

const expenseRateEnumValues = [
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
] as const;

export const expenseRateEnum = {
	enumValues: expenseRateEnumValues,
};

export const expenses = sqliteTable("expenses", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	created_at: text("created_at")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	last_modified: text("last_modified")
		.$defaultFn(() => getNowInUTC())
		.notNull(),
	name: text("name").notNull().unique(),
	category: text("category", { enum: expenseCategoryEnumValues })
		.notNull()
		.default("Software"),
	type: text("type", { enum: expenseTypeEnumValues })
		.notNull()
		.default("Personal"),
	rate: text("rate", { enum: expenseRateEnumValues })
		.notNull()
		.default("Monthly"),
	originalPrice: real("original_price").notNull().default(0.0),
	originalCurrency: text("original_currency", {
		enum: currencyEnum.enumValues,
	}).notNull(),
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
				.default(() => getNowInUTC()),
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
	currency: one(currencies, {
		fields: [expenses.id],
		references: [currencies.id],
		relationName: "currency",
	}),
}));
