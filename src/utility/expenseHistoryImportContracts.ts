import { z } from "zod";

export const expenseHistoryImportRequestSchema = z.object({
	workbookBase64: z
		.string()
		.min(1, "Excel workbook content is required")
		.max(20_000_000, "Excel workbook is too large"),
	sourceFilename: z
		.string()
		.trim()
		.min(1, "Source filename is required")
		.max(255, "Source filename is too long")
		.refine(
			(filename) => filename.toLowerCase().endsWith(".xlsx"),
			"Source file must be an XLSX workbook",
		),
});

export const expenseHistoryImportCommitRequestSchema =
	expenseHistoryImportRequestSchema.extend({
		replaceExistingMonths: z.boolean().optional().default(false),
	});

export const expenseHistoryImportPreviewSchema = z.object({
	months: z.array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)).nonempty(),
	debitCount: z.number().int().positive(),
	skippedCreditCount: z.number().int().nonnegative(),
	totalDebitAmount: z.number().finite().positive(),
	warnings: z.array(z.string()),
	replacementRequired: z.boolean(),
	replacementMonths: z.array(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)),
});

export const expenseHistoryImportCommitResultSchema =
	expenseHistoryImportPreviewSchema.extend({
		replacedExistingMonths: z.array(
			z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
		),
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
