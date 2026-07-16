import { z } from "zod";
import {
	currencyEnum,
	expenseCategoryEnum,
	expenseTypeEnum,
} from "@/db/schema";

export const expenseHistoryMonthKeySchema = z
	.string()
	.regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const expenseHistoryMonthSummarySchema = z.object({
	month: expenseHistoryMonthKeySchema,
	importedAt: z.string(),
	importedDebitCount: z.number().int().nonnegative(),
	skippedCreditCount: z.number().int().nonnegative(),
});

export const expenseHistoryMonthsSchema = z.array(
	expenseHistoryMonthSummarySchema,
);

export const expenseHistoryTransactionSchema = z.object({
	id: z.number().int().positive(),
	bookedAt: z.iso.date(),
	valueDate: z.iso.date().nullable(),
	description: z.string().min(1),
	amount: z.number().finite().nonnegative(),
	originalDescription: z.string().min(1),
	originalAmount: z.number().finite().positive(),
	category: z.enum(expenseCategoryEnum.enumValues).nullable(),
	type: z.enum(expenseTypeEnum.enumValues).nullable(),
	expense: z
		.object({
			id: z.number().int().positive(),
			name: z.string().min(1),
		})
		.nullable(),
	lastModified: z.string().min(1),
});

export const expenseHistoryMonthlySummarySchema = z.object({
	total: z.number().finite().nonnegative(),
	matched: z.number().finite().nonnegative(),
	other: z.number().finite().nonnegative(),
});

export const expenseHistoryMonthDetailSchema = z.object({
	month: expenseHistoryMonthSummarySchema,
	transactions: z.array(expenseHistoryTransactionSchema),
	summary: expenseHistoryMonthlySummarySchema,
});

export const expenseOverviewSummarySchema = z.object({
	currency: z.enum(currencyEnum.enumValues),
	importedMonthCount: z.number().int().nonnegative(),
	configuredMonthlyTotal: z.number().finite().nonnegative(),
	recurring: z.array(
		z.object({
			expenseId: z.number().int().positive(),
			total: z.number().finite().nonnegative(),
			monthlyAverage: z.number().finite().nonnegative().nullable(),
		}),
	),
	other: z
		.object({
			total: z.number().finite().nonnegative(),
			monthlyAverage: z.number().finite().nonnegative(),
		})
		.nullable(),
	livingCostEstimate: z.number().finite().nonnegative().nullable(),
	observedMonthlyAverage: z.number().finite().nonnegative().nullable(),
});

export const expenseHistoryTransactionMutationSchema = z
	.object({
		lastModified: z.string().min(1),
		description: z.string().trim().min(1).optional(),
		amount: z.number().finite().nonnegative().optional(),
		category: z.enum(expenseCategoryEnum.enumValues).nullable().optional(),
		type: z.enum(expenseTypeEnum.enumValues).nullable().optional(),
		expenseId: z.number().int().positive().nullable().optional(),
	})
	.strict()
	.refine(
		(value) => Object.keys(value).some((key) => key !== "lastModified"),
		"At least one editable field is required.",
	);

export const expenseHistoryCreateExpenseSchema = z
	.object({
		lastModified: z.string().min(1),
		name: z.string().trim().min(1),
		originalPrice: z.number().finite().nonnegative(),
		category: z.enum(expenseCategoryEnum.enumValues),
		type: z.enum(expenseTypeEnum.enumValues),
	})
	.strict();

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
export type ExpenseOverviewSummary = z.infer<
	typeof expenseOverviewSummarySchema
>;
