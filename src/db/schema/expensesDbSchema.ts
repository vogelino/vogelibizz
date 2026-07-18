import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	real,
	sqliteTable,
	text,
	unique,
} from "drizzle-orm/sqlite-core";
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
	"Dining",
	"Groceries",
	"Shopping",
	"Cash Withdrawal",
	"Taxes",
	"Payments",
	"Other Income",
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

export const expenseMonths = sqliteTable(
	"expense_months",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		month: text("month").notNull().unique(),
		sourceFilename: text("source_filename").notNull(),
		imported_at: text("imported_at")
			.$defaultFn(() => getNowInUTC())
			.notNull(),
		last_modified: text("last_modified")
			.$defaultFn(() => getNowInUTC())
			.notNull(),
		importedDebitCount: integer("imported_debit_count").notNull(),
		skippedCreditCount: integer("skipped_credit_count").notNull().default(0),
	},
	(table) => [
		check(
			"expense_months_month_check",
			sql`length(${table.month}) = 7
				and ${table.month} glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]'
				and cast(substr(${table.month}, 6, 2) as integer) between 1 and 12`,
		),
		check(
			"expense_months_source_filename_check",
			sql`length(trim(${table.sourceFilename})) > 0`,
		),
		check(
			"expense_months_imported_debit_count_check",
			sql`${table.importedDebitCount} >= 0`,
		),
		check(
			"expense_months_skipped_credit_count_check",
			sql`${table.skippedCreditCount} >= 0`,
		),
	],
);

export const expenseTransactions = sqliteTable(
	"expense_transactions",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		expenseMonthId: integer("expense_month_id")
			.notNull()
			.references(() => expenseMonths.id, { onDelete: "cascade" }),
		expenseId: integer("expense_id").references(() => expenses.id, {
			onDelete: "set null",
		}),
		bookedAt: text("booked_at").notNull(),
		valueDate: text("value_date"),
		originalDescription: text("original_description").notNull(),
		description: text("description").notNull(),
		originalAmount: real("original_amount").notNull(),
		amount: real("amount").notNull(),
		category: text("category", { enum: expenseCategoryEnumValues }),
		type: text("type", { enum: expenseTypeEnumValues }),
		sourceOrder: integer("source_order").notNull(),
		created_at: text("created_at")
			.$defaultFn(() => getNowInUTC())
			.notNull(),
		last_modified: text("last_modified")
			.$defaultFn(() => getNowInUTC())
			.notNull(),
	},
	(table) => [
		unique("expense_transactions_month_source_order_unique").on(
			table.expenseMonthId,
			table.sourceOrder,
		),
		index("expense_transactions_expense_month_idx").on(table.expenseMonthId),
		index("expense_transactions_month_booked_order_idx").on(
			table.expenseMonthId,
			table.bookedAt,
			table.sourceOrder,
		),
		index("expense_transactions_expense_idx").on(table.expenseId),
		index("expense_transactions_booked_at_idx").on(table.bookedAt),
		check(
			"expense_transactions_booked_at_check",
			sql`length(${table.bookedAt}) = 10
				and ${table.bookedAt} glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'`,
		),
		check(
			"expense_transactions_value_date_check",
			sql`${table.valueDate} is null or (
				length(${table.valueDate}) = 10
				and ${table.valueDate} glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
			)`,
		),
		check(
			"expense_transactions_original_description_check",
			sql`length(trim(${table.originalDescription})) > 0`,
		),
		check(
			"expense_transactions_description_check",
			sql`length(trim(${table.description})) > 0`,
		),
		check(
			"expense_transactions_original_amount_check",
			sql`${table.originalAmount} > 0`,
		),
		check("expense_transactions_amount_check", sql`${table.amount} >= 0`),
		check(
			"expense_transactions_source_order_check",
			sql`${table.sourceOrder} >= 0`,
		),
	],
);

export type ExpenseType = typeof expenses.$inferSelect;
export type ExpenseInsertType = typeof expenses.$inferInsert;
export type ExpenseMonthType = typeof expenseMonths.$inferSelect;
export type ExpenseMonthInsertType = typeof expenseMonths.$inferInsert;
export type ExpenseTransactionType = typeof expenseTransactions.$inferSelect;
export type ExpenseTransactionInsertType =
	typeof expenseTransactions.$inferInsert;

export const expenseSelectSchema = createSelectSchema(expenses);
export const expenseInsertSchema = createInsertSchema(expenses);
const calendarMonthSchema = z
	.string()
	.regex(
		/^\d{4}-(0[1-9]|1[0-2])$/,
		"Expected a calendar month in YYYY-MM form",
	);
const calendarDateSchema = z.iso.date();
const nonEmptyTextSchema = z
	.string()
	.refine((value) => value.trim().length > 0, "Expected non-empty text");
const nonNegativeIntegerSchema = z.number().int().nonnegative();
const nonNegativeAmountSchema = z.number().finite().nonnegative();
const positiveAmountSchema = z.number().finite().positive();

export const expenseMonthSelectSchema = createSelectSchema(
	expenseMonths,
).extend({
	month: calendarMonthSchema,
	sourceFilename: nonEmptyTextSchema,
	importedDebitCount: nonNegativeIntegerSchema,
	skippedCreditCount: nonNegativeIntegerSchema,
});
export const expenseMonthInsertSchema = createInsertSchema(
	expenseMonths,
).extend({
	month: calendarMonthSchema,
	sourceFilename: nonEmptyTextSchema,
	importedDebitCount: nonNegativeIntegerSchema,
	skippedCreditCount: nonNegativeIntegerSchema.optional().default(0),
});
export const expenseTransactionSelectSchema = createSelectSchema(
	expenseTransactions,
).extend({
	bookedAt: calendarDateSchema,
	valueDate: calendarDateSchema.nullable(),
	originalDescription: nonEmptyTextSchema,
	description: nonEmptyTextSchema,
	originalAmount: positiveAmountSchema,
	amount: nonNegativeAmountSchema,
	sourceOrder: nonNegativeIntegerSchema,
});
export const expenseTransactionInsertSchema = createInsertSchema(
	expenseTransactions,
).extend({
	bookedAt: calendarDateSchema,
	valueDate: calendarDateSchema.nullable().optional(),
	originalDescription: nonEmptyTextSchema,
	description: nonEmptyTextSchema,
	originalAmount: positiveAmountSchema,
	amount: nonNegativeAmountSchema,
	sourceOrder: nonNegativeIntegerSchema,
});
export const expenseEditSchema = expenseSelectSchema
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
	);
export type ExpenseEditType = z.infer<typeof expenseEditSchema>;

export const expenseWithMonthlyCLPPriceSchema = expenseSelectSchema.extend({
	clpMonthlyPrice: z.number(),
});

export type ExpenseWithMonthlyCLPPriceType = z.infer<
	typeof expenseWithMonthlyCLPPriceSchema
>;

export const expensesRelations = relations(expenses, ({ many, one }) => ({
	currency: one(currencies, {
		fields: [expenses.id],
		references: [currencies.id],
		relationName: "currency",
	}),
	transactions: many(expenseTransactions),
}));

export const expenseMonthsRelations = relations(expenseMonths, ({ many }) => ({
	transactions: many(expenseTransactions),
}));

export const expenseTransactionsRelations = relations(
	expenseTransactions,
	({ one }) => ({
		month: one(expenseMonths, {
			fields: [expenseTransactions.expenseMonthId],
			references: [expenseMonths.id],
		}),
		expense: one(expenses, {
			fields: [expenseTransactions.expenseId],
			references: [expenses.id],
		}),
	}),
);
