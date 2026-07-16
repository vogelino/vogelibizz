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
	BankCsvValidationError,
	type ParsedBankCsv,
	parseBankCsv,
} from "./bankCsvParser";

export type ExpenseHistoryImportDataset = ParsedBankCsv & {
	sourceFilename: string;
};

export interface ExpenseHistoryImportPersistence {
	monthExists(month: string): Promise<boolean>;
	writeMonthAtomically(
		dataset: ExpenseHistoryImportDataset,
		replaceExistingMonth: boolean,
	): Promise<void>;
}

export class ExpenseHistoryReplacementRequiredError extends Error {
	readonly code = "EXPENSE_HISTORY_REPLACEMENT_REQUIRED";
	readonly month: string;

	constructor(month: string) {
		super(
			`Expense history for ${month} already exists. Confirm replacement to overwrite its transactions, edits, and associations.`,
		);
		this.name = "ExpenseHistoryReplacementRequiredError";
		this.month = month;
	}
}

function safeSourceFilename(sourceFilename: string) {
	const normalized = sourceFilename
		.replace(/\\/g, "/")
		.split("/")
		.at(-1)
		?.trim();
	if (!normalized) {
		throw new BankCsvValidationError("Source filename must not be empty.");
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
		async writeMonthAtomically(dataset, replaceExistingMonth) {
			const timestamp = new Date().toISOString();
			const client = db.$client;
			const statements: D1PreparedStatement[] = [];
			if (replaceExistingMonth) {
				statements.push(
					client
						.prepare("delete from expense_months where month = ?")
						.bind(dataset.month),
				);
			}
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
						id, null, ?, ?, ?, ?, ?, ?, null, null, ?, ?, ?
					from expense_months where month = ?
				`)
						.bind(
							debit.bookedAt,
							debit.valueDate,
							debit.description,
							debit.description,
							debit.amount,
							debit.amount,
							debit.sourceOrder,
							timestamp,
							timestamp,
							dataset.month,
						),
				);
			}
			await client.batch(statements);
		},
	};

function previewFromParsed(
	parsed: ParsedBankCsv,
	replacementRequired: boolean,
): ExpenseHistoryImportPreview {
	return {
		month: parsed.month,
		debitCount: parsed.debits.length,
		skippedCreditCount: parsed.skippedCreditCount,
		totalDebitAmount: parsed.totalDebitAmount,
		warnings: parsed.warnings,
		replacementRequired,
	};
}

export async function previewExpenseHistoryImport(
	request: ExpenseHistoryImportRequest,
	persistence: ExpenseHistoryImportPersistence = d1ExpenseHistoryImportPersistence,
): Promise<ExpenseHistoryImportPreview> {
	const parsed = parseBankCsv(request.csv);
	return previewFromParsed(parsed, await persistence.monthExists(parsed.month));
}

export async function commitExpenseHistoryImport(
	request: ExpenseHistoryImportCommitRequest,
	persistence: ExpenseHistoryImportPersistence = d1ExpenseHistoryImportPersistence,
): Promise<ExpenseHistoryImportCommitResult> {
	const parsed = parseBankCsv(request.csv);
	const existed = await persistence.monthExists(parsed.month);
	if (existed && !request.replaceExistingMonth) {
		throw new ExpenseHistoryReplacementRequiredError(parsed.month);
	}
	await persistence.writeMonthAtomically(
		{ ...parsed, sourceFilename: safeSourceFilename(request.sourceFilename) },
		existed && request.replaceExistingMonth,
	);
	return {
		...previewFromParsed(parsed, existed),
		replacedExistingMonth: existed,
	};
}
