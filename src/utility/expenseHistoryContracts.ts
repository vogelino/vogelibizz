import { z } from "zod";
import {
	currencyEnum,
	expenseCategoryEnum,
	expenseRateEnum,
	expenseTypeEnum,
} from "@/db/schema";

export const expenseHistoryMonthKeySchema = z
	.string()
	.regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const expenseHistoryMonthSummarySchema = z.object({
	month: expenseHistoryMonthKeySchema,
	importedAt: z.string(),
	importedDebitCount: z.int().nonnegative(),
	skippedCreditCount: z.int().nonnegative(),
});

export const expenseHistoryMonthsSchema = z.array(
	expenseHistoryMonthSummarySchema,
);

export const expenseHistoryTransactionSchema = z.object({
	id: z.int().positive(),
	bookedAt: z.iso.date(),
	valueDate: z.iso.date().nullable(),
	description: z.string().min(1),
	amount: z.number().nonnegative(),
	originalDescription: z.string().min(1),
	originalAmount: z.number().positive(),
	category: z.enum(expenseCategoryEnum.enumValues).nullable(),
	type: z.enum(expenseTypeEnum.enumValues).nullable(),
	expense: z
		.object({
			id: z.int().positive(),
			name: z.string().min(1),
		})
		.nullable(),
	lastModified: z.string().min(1),
});

export const expenseHistoryMonthlySummarySchema = z.object({
	total: z.number().nonnegative(),
	matched: z.number().nonnegative(),
	other: z.number().nonnegative(),
});

export const expenseHistoryMonthDetailSchema = z.object({
	currency: z.enum(currencyEnum.enumValues),
	month: expenseHistoryMonthSummarySchema.nullable(),
	transactions: z.array(expenseHistoryTransactionSchema),
	summary: expenseHistoryMonthlySummarySchema,
	totalCount: z.int().nonnegative(),
	nextOffset: z.int().nonnegative().nullable(),
});

export const expenseHistoryTransactionDetailSchema = z.object({
	month: expenseHistoryMonthKeySchema,
	transaction: expenseHistoryTransactionSchema,
});

export const expenseOverviewSummarySchema = z.object({
	currency: z.enum(currencyEnum.enumValues),
	importedMonthCount: z.int().nonnegative(),
	configuredMonthlyTotal: z.number().nonnegative(),
	recurring: z.array(
		z.object({
			expenseId: z.int().positive(),
			total: z.number().nonnegative(),
			monthlyAverage: z.number().nonnegative().nullable(),
		}),
	),
	other: z
		.object({
			total: z.number().nonnegative(),
			monthlyAverage: z.number().nonnegative(),
		})
		.nullable(),
	livingCostEstimate: z.number().nonnegative().nullable(),
	observedMonthlyAverage: z.number().nonnegative().nullable(),
});

export const expenseDashboardCategorySchema = z.object({
	category: z.enum(expenseCategoryEnum.enumValues).nullable(),
	total: z.number().nonnegative(),
	transactionCount: z.int().nonnegative(),
});

export const expenseDashboardDaySchema = z.object({
	date: z.iso.date(),
	total: z.number().nonnegative(),
	transactionCount: z.int().nonnegative(),
});

export const expenseDashboardSchema = z.object({
	currency: z.enum(currencyEnum.enumValues),
	importedMonthCount: z.int().nonnegative(),
	configuredMonthlyTotal: z.number().nonnegative(),
	typicalMonthlyTotal: z.number().nonnegative().nullable(),
	days: z.array(expenseDashboardDaySchema),
	months: z.array(
		z.object({
			month: expenseHistoryMonthKeySchema,
			total: z.number().nonnegative(),
			matched: z.number().nonnegative(),
			unmatched: z.number().nonnegative(),
			unmatchedCount: z.int().nonnegative(),
			uncategorizedCount: z.int().nonnegative(),
			reviewCount: z.int().nonnegative(),
			categories: z.array(expenseDashboardCategorySchema),
		}),
	),
	latest: z
		.object({
			month: expenseHistoryMonthKeySchema,
			total: z.number().nonnegative(),
			previousTotal: z.number().nonnegative().nullable(),
			matched: z.number().nonnegative(),
			unmatched: z.number().nonnegative(),
			unmatchedCount: z.int().nonnegative(),
			uncategorizedTotal: z.number().nonnegative(),
			uncategorizedCount: z.int().nonnegative(),
			reviewCount: z.int().nonnegative(),
			categories: z.array(expenseDashboardCategorySchema),
		})
		.nullable(),
	recurring: z.array(
		z.object({
			expenseId: z.int().positive(),
			name: z.string().min(1),
			category: z.enum(expenseCategoryEnum.enumValues),
			rate: z.enum(expenseRateEnum.enumValues),
			plannedMonthly: z.number().nonnegative(),
			plannedCharge: z.number().nonnegative(),
			actualMonthlyAverage: z.number().nonnegative().nullable(),
			difference: z.number().nullable(),
			monthlyActuals: z.array(
				z.object({
					month: expenseHistoryMonthKeySchema,
					total: z.number().nonnegative(),
					transactionCount: z.int().nonnegative(),
				}),
			),
		}),
	),
});

export const expenseHistoryTransactionMutationSchema = z
	.strictObject({
		lastModified: z.string().min(1),
		description: z.string().trim().min(1).optional(),
		amount: z.number().nonnegative().optional(),
		category: z.enum(expenseCategoryEnum.enumValues).nullable().optional(),
		type: z.enum(expenseTypeEnum.enumValues).nullable().optional(),
		expenseId: z.int().positive().nullable().optional(),
	})
	.refine(
		(value) => Object.keys(value).some((key) => key !== "lastModified"),
		"At least one editable field is required.",
	);

export const expenseHistoryCreateExpenseSchema = z.strictObject({
	lastModified: z.string().min(1),
	name: z.string().trim().min(1),
	originalPrice: z.number().nonnegative(),
	category: z.enum(expenseCategoryEnum.enumValues),
	type: z.enum(expenseTypeEnum.enumValues),
});

export type ExpenseHistoryTransactionMutation = z.infer<
	typeof expenseHistoryTransactionMutationSchema
>;
export type ExpenseHistoryCreateExpense = z.infer<
	typeof expenseHistoryCreateExpenseSchema
>;

export type ExpenseHistoryMonthSummary = z.infer<
	typeof expenseHistoryMonthSummarySchema
>;
export type ExpenseHistoryMonthDetail = z.infer<
	typeof expenseHistoryMonthDetailSchema
>;
export type ExpenseHistoryTransaction = z.infer<
	typeof expenseHistoryTransactionSchema
>;
export type ExpenseHistoryTransactionDetail = z.infer<
	typeof expenseHistoryTransactionDetailSchema
>;
export type ExpenseOverviewSummary = z.infer<
	typeof expenseOverviewSummarySchema
>;
export type ExpenseDashboard = z.infer<typeof expenseDashboardSchema>;
