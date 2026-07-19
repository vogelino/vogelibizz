import type { expenseCategoryEnum } from "@/db/schema/expensesDbSchema";

export type ImportedExpenseCategory =
	(typeof expenseCategoryEnum.enumValues)[number];

export type ParsedBankDebit = {
	bookedAt: string;
	valueDate: string | null;
	description: string;
	amount: number;
	sourceOrder: number;
	category: ImportedExpenseCategory;
};

export type ParsedBankTransaction = Omit<ParsedBankDebit, "amount"> & {
	signedAmount: number;
	sourceRowNumber: number;
};

export type SkippedBankCredit = {
	rowNumber: number;
	bookedAt: string;
	description: string;
	amount: number;
};

export type ParsedBankImportMonth = {
	month: string;
	debits: ParsedBankDebit[];
	skippedCreditCount: number;
	totalDebitAmount: number;
};

export type ParsedBankImport = {
	months: ParsedBankImportMonth[];
	debitCount: number;
	skippedCreditCount: number;
	skippedCredits: SkippedBankCredit[];
	totalDebitAmount: number;
	warnings: string[];
};

export class BankImportValidationError extends Error {
	readonly code = "INVALID_BANK_IMPORT";

	constructor(message: string) {
		super(message);
		this.name = "BankImportValidationError";
	}
}

export function groupParsedBankTransactions(
	parsedTransactions: ParsedBankTransaction[],
	additionalWarnings: string[] = [],
): ParsedBankImport {
	if (parsedTransactions.length === 0) {
		throw new BankImportValidationError(
			"The workbook contains no usable transaction rows.",
		);
	}
	const debits = parsedTransactions
		.filter(({ signedAmount }) => signedAmount < 0)
		.map(
			({
				signedAmount,
				sourceRowNumber: _sourceRowNumber,
				...transaction
			}) => ({
				...transaction,
				amount: Math.abs(signedAmount),
			}),
		);
	if (debits.length === 0) {
		throw new BankImportValidationError(
			"The workbook contains no debit transactions to import.",
		);
	}
	const skippedCredits = parsedTransactions
		.filter(({ signedAmount }) => signedAmount > 0)
		.map(({ sourceRowNumber, bookedAt, description, signedAmount }) => ({
			rowNumber: sourceRowNumber,
			bookedAt,
			description,
			amount: signedAmount,
		}));
	const skippedCreditCount = skippedCredits.length;
	const warnings = [...additionalWarnings];
	const monthKeys = [
		...new Set(
			parsedTransactions.map((transaction) => transaction.bookedAt.slice(0, 7)),
		),
	].sort();
	const months = monthKeys.map((month) => {
		const monthTransactions = parsedTransactions.filter((transaction) =>
			transaction.bookedAt.startsWith(month),
		);
		const monthDebits = debits.filter((debit) =>
			debit.bookedAt.startsWith(month),
		);
		return {
			month,
			debits: monthDebits,
			skippedCreditCount: monthTransactions.length - monthDebits.length,
			totalDebitAmount: Number(
				monthDebits
					.reduce((total, debit) => total + debit.amount, 0)
					.toFixed(2),
			),
		};
	});
	return {
		months,
		debitCount: debits.length,
		skippedCreditCount,
		skippedCredits,
		totalDebitAmount: Number(
			debits.reduce((total, debit) => total + debit.amount, 0).toFixed(2),
		),
		warnings,
	};
}
