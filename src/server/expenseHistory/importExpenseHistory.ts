import { sql } from "drizzle-orm";
import db from "@/db";
import type { D1PreparedStatement } from "@/db/d1Types";
import type {
	ExpenseHistoryImportCommitRequest,
	ExpenseHistoryImportCommitResult,
	ExpenseHistoryImportPreview,
	ExpenseHistoryImportRequest,
} from "@/utility/expenseHistoryImportContracts";
import {
	BankImportValidationError,
	type ParsedBankImport,
	type ParsedBankImportMonth,
} from "./bankImportParser";
import { parseBankXlsx } from "./bankXlsxParser";

export type ExpenseHistoryImportDataset = ParsedBankImportMonth & {
	sourceFilename: string;
};

export interface ExpenseHistoryImportPersistence {
	monthExists(month: string): Promise<boolean>;
	writeMonthsAtomically(
		datasets: ExpenseHistoryImportDataset[],
		replaceExistingMonths: string[],
	): Promise<void>;
}

export class ExpenseHistoryReplacementRequiredError extends Error {
	readonly code = "EXPENSE_HISTORY_REPLACEMENT_REQUIRED";
	readonly months: string[];

	constructor(months: string[]) {
		super(
			`Expense history for ${months.join(", ")} already exists. Confirm replacement to overwrite the existing transactions, edits, and associations for all included months.`,
		);
		this.name = "ExpenseHistoryReplacementRequiredError";
		this.months = months;
	}
}

function safeSourceFilename(sourceFilename: string) {
	const normalized = sourceFilename
		.replace(/\\/g, "/")
		.split("/")
		.at(-1)
		?.trim();
	if (!normalized) {
		throw new BankImportValidationError("Source filename must not be empty.");
	}
	return normalized.slice(0, 255);
}

export const d1ExpenseHistoryImportPersistence: ExpenseHistoryImportPersistence =
	{
		async monthExists(month) {
			const result = await db.get<{ exists: number }>(sql`
			select exists(
				select 1 from expense_months where month = ${month}
			) as "exists"
		`);
			return result?.exists === 1;
		},
		async writeMonthsAtomically(datasets, replaceExistingMonths) {
			const timestamp = new Date().toISOString();
			const client = db.$client;
			const statements: D1PreparedStatement[] = [];
			for (const month of replaceExistingMonths) {
				statements.push(
					client
						.prepare("delete from expense_months where month = ?")
						.bind(month),
				);
			}
			for (const dataset of datasets) {
				statements.push(
					client
						.prepare(`
				insert into expense_months (
					month, source_filename, imported_at, last_modified,
					imported_debit_count, skipped_credit_count
				) values (?, ?, ?, ?, ?, ?)
			`)
						.bind(
							dataset.month,
							dataset.sourceFilename,
							timestamp,
							timestamp,
							dataset.debits.length,
							dataset.skippedCreditCount,
						),
				);
				for (const debit of dataset.debits) {
					statements.push(
						client
							.prepare(`
					insert into expense_transactions (
						expense_month_id, expense_id, booked_at, value_date,
						original_description, description, original_amount, amount,
						category, type, source_order, created_at, last_modified
					)
					select
						id, null, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?
					from expense_months where month = ?
				`)
							.bind(
								debit.bookedAt,
								debit.valueDate,
								debit.description,
								debit.description,
								debit.amount,
								debit.amount,
								debit.category,
								debit.sourceOrder,
								timestamp,
								timestamp,
								dataset.month,
							),
					);
				}
			}
			await client.batch(statements);
		},
	};

function previewFromParsed(
	parsed: ParsedBankImport,
	replacementMonths: string[],
): ExpenseHistoryImportPreview {
	return {
		months: parsed.months.map(({ month }) => month),
		debitCount: parsed.debitCount,
		skippedCreditCount: parsed.skippedCreditCount,
		skippedCredits: parsed.skippedCredits,
		totalDebitAmount: parsed.totalDebitAmount,
		warnings: parsed.warnings,
		replacementRequired: replacementMonths.length > 0,
		replacementMonths,
	};
}

export async function previewExpenseHistoryImport(
	request: ExpenseHistoryImportRequest,
	persistence: ExpenseHistoryImportPersistence = d1ExpenseHistoryImportPersistence,
): Promise<ExpenseHistoryImportPreview> {
	const parsed = parseBankXlsx(request.workbookBase64);
	const existence = await Promise.all(
		parsed.months.map(async ({ month }) => ({
			month,
			exists: await persistence.monthExists(month),
		})),
	);
	return previewFromParsed(
		parsed,
		existence.filter(({ exists }) => exists).map(({ month }) => month),
	);
}

export async function commitExpenseHistoryImport(
	request: ExpenseHistoryImportCommitRequest,
	persistence: ExpenseHistoryImportPersistence = d1ExpenseHistoryImportPersistence,
): Promise<ExpenseHistoryImportCommitResult> {
	const parsed = parseBankXlsx(request.workbookBase64);
	const existence = await Promise.all(
		parsed.months.map(async ({ month }) => ({
			month,
			exists: await persistence.monthExists(month),
		})),
	);
	const replacementMonths = existence
		.filter(({ exists }) => exists)
		.map(({ month }) => month);
	if (replacementMonths.length > 0 && !request.replaceExistingMonths) {
		throw new ExpenseHistoryReplacementRequiredError(replacementMonths);
	}
	const sourceFilename = safeSourceFilename(request.sourceFilename);
	await persistence.writeMonthsAtomically(
		parsed.months.map((month) => ({ ...month, sourceFilename })),
		request.replaceExistingMonths ? replacementMonths : [],
	);
	return {
		...previewFromParsed(parsed, replacementMonths),
		replacedExistingMonths: replacementMonths,
	};
}
