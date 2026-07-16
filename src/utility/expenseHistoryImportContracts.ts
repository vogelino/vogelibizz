import { z } from "zod";

export const expenseHistoryImportRequestSchema = z.object({
	csv: z.string().min(1, "CSV content is required"),
	sourceFilename: z
		.string()
		.trim()
		.min(1, "Source filename is required")
		.max(255, "Source filename is too long"),
});

export const expenseHistoryImportCommitRequestSchema =
	expenseHistoryImportRequestSchema.extend({
		replaceExistingMonth: z.boolean().optional().default(false),
	});

export const expenseHistoryImportPreviewSchema = z.object({
	month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
	debitCount: z.number().int().positive(),
	skippedCreditCount: z.number().int().nonnegative(),
	totalDebitAmount: z.number().finite().positive(),
	warnings: z.array(z.string()),
	replacementRequired: z.boolean(),
});

export const expenseHistoryImportCommitResultSchema =
	expenseHistoryImportPreviewSchema.extend({
		replacedExistingMonth: z.boolean(),
	});

export type ExpenseHistoryImportRequest = z.infer<
	typeof expenseHistoryImportRequestSchema
>;
export type ExpenseHistoryImportCommitRequest = z.infer<
	typeof expenseHistoryImportCommitRequestSchema
>;
export type ExpenseHistoryImportPreview = z.infer<
	typeof expenseHistoryImportPreviewSchema
>;
export type ExpenseHistoryImportCommitResult = z.infer<
	typeof expenseHistoryImportCommitResultSchema
>;
