import { z } from "zod";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";

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
});

export const expenseHistoryMonthDetailSchema = z.object({
	month: expenseHistoryMonthSummarySchema,
	transactions: z.array(expenseHistoryTransactionSchema),
});

export type ExpenseHistoryMonthSummary = z.infer<
	typeof expenseHistoryMonthSummarySchema
>;
export type ExpenseHistoryMonthDetail = z.infer<
	typeof expenseHistoryMonthDetailSchema
>;
export type ExpenseHistoryTransaction = z.infer<
	typeof expenseHistoryTransactionSchema
>;
