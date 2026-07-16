export const BANK_CSV_HEADERS = [
	"IBAN",
	"Booked At",
	"Text",
	"Credit/Debit Amount",
	"Balance",
	"Valuta Date",
] as const;

export type ParsedBankDebit = {
	bookedAt: string;
	valueDate: string | null;
	description: string;
	amount: number;
	sourceOrder: number;
};

export type ParsedBankCsv = {
	month: string;
	debits: ParsedBankDebit[];
	skippedCreditCount: number;
	totalDebitAmount: number;
	warnings: string[];
};

export class BankCsvValidationError extends Error {
	readonly code = "INVALID_BANK_CSV";

	constructor(message: string) {
		super(message);
		this.name = "BankCsvValidationError";
	}
}

function parseSemicolonCsv(input: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let quoted = false;

	for (let index = 0; index < input.length; index += 1) {
		const character = input[index];
		if (quoted) {
			if (character === '"') {
				if (input[index + 1] === '"') {
					field += '"';
					index += 1;
				} else {
					quoted = false;
				}
			} else {
				field += character;
			}
			continue;
		}

		if (character === '"') {
			if (field.length > 0) {
				throw new BankCsvValidationError(
					`Invalid quote in CSV row ${rows.length + 1}.`,
				);
			}
			quoted = true;
		} else if (character === ";") {
			row.push(field);
			field = "";
		} else if (character === "\n" || character === "\r") {
			if (character === "\r" && input[index + 1] === "\n") index += 1;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += character;
		}
	}

	if (quoted) {
		throw new BankCsvValidationError(
			"The CSV contains an unclosed quoted field.",
		);
	}
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

function normalizeDate(value: string, rowNumber: number, label: string) {
	const trimmed = value.trim();
	let year: number;
	let month: number;
	let day: number;
	const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
	const swissMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
	if (isoMatch) {
		[, year, month, day] = isoMatch.map(Number);
	} else if (swissMatch) {
		[, day, month, year] = swissMatch.map(Number);
	} else {
		throw new BankCsvValidationError(
			`Row ${rowNumber}: ${label} must use DD.MM.YYYY or YYYY-MM-DD.`,
		);
	}
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		throw new BankCsvValidationError(
			`Row ${rowNumber}: ${label} is not a valid calendar date.`,
		);
	}
	return `${year.toString().padStart(4, "0")}-${month
		.toString()
		.padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function parseAmount(value: string, rowNumber: number, label: string) {
	const compact = value
		.trim()
		.replace(/[\s'’]/g, "")
		.replace(/CHF$/i, "");
	if (!/^[+-]?(?:\d+(?:[.,]\d{1,2})?|[.,]\d{1,2})$/.test(compact)) {
		throw new BankCsvValidationError(
			`Row ${rowNumber}: ${label} is not a valid CHF amount.`,
		);
	}
	const amount = Number(compact.replace(",", "."));
	if (!Number.isFinite(amount)) {
		throw new BankCsvValidationError(
			`Row ${rowNumber}: ${label} is not a valid CHF amount.`,
		);
	}
	return amount;
}

function normalizeDescription(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

export function parseBankCsv(rawCsv: string): ParsedBankCsv {
	if (rawCsv.trim().length === 0) {
		throw new BankCsvValidationError("The CSV is empty.");
	}
	const rows = parseSemicolonCsv(rawCsv);
	while (
		rows.length > 0 &&
		rows[rows.length - 1].every((cell) => !cell.trim())
	) {
		rows.pop();
	}
	if (rows.length === 0) throw new BankCsvValidationError("The CSV is empty.");

	const header = rows[0].map((cell, index) =>
		index === 0 ? cell.replace(/^\uFEFF/, "").trim() : cell.trim(),
	);
	const missing = BANK_CSV_HEADERS.filter(
		(required) => !header.includes(required),
	);
	if (missing.length > 0) {
		throw new BankCsvValidationError(
			`Missing required CSV header${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}.`,
		);
	}
	const indexes = Object.fromEntries(
		BANK_CSV_HEADERS.map((name) => [name, header.indexOf(name)]),
	) as Record<(typeof BANK_CSV_HEADERS)[number], number>;
	const parsedTransactions: Array<{
		bookedAt: string;
		valueDate: string | null;
		description: string;
		signedAmount: number;
		sourceOrder: number;
	}> = [];

	for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
		const rowNumber = rowIndex + 1;
		const cells = rows[rowIndex];
		if (cells.every((cell) => !cell.trim())) continue;
		if (
			cells.length > header.length &&
			cells.slice(header.length).some((cell) => cell.trim())
		) {
			throw new BankCsvValidationError(
				`Row ${rowNumber}: contains more columns than the header.`,
			);
		}
		const get = (name: (typeof BANK_CSV_HEADERS)[number]) =>
			(cells[indexes[name]] ?? "").trim();
		const text = normalizeDescription(get("Text"));
		const otherValues = BANK_CSV_HEADERS.filter((name) => name !== "Text").map(
			get,
		);
		const continuation =
			text.length > 0 && otherValues.every((value) => !value);
		if (continuation) {
			const preceding = parsedTransactions.at(-1);
			if (!preceding) {
				throw new BankCsvValidationError(
					`Row ${rowNumber}: Text continuation has no preceding transaction.`,
				);
			}
			preceding.description = `${preceding.description} ${text}`;
			continue;
		}

		if (!text) {
			throw new BankCsvValidationError(
				`Row ${rowNumber}: transaction Text must not be empty.`,
			);
		}
		const bookedAtValue = get("Booked At");
		const amountValue = get("Credit/Debit Amount");
		if (!bookedAtValue || !amountValue) {
			throw new BankCsvValidationError(
				`Row ${rowNumber}: transaction rows require Booked At and Credit/Debit Amount.`,
			);
		}
		const bookedAt = normalizeDate(bookedAtValue, rowNumber, "Booked At");
		const valueDateValue = get("Valuta Date");
		const valueDate = valueDateValue
			? normalizeDate(valueDateValue, rowNumber, "Valuta Date")
			: null;
		const signedAmount = parseAmount(
			amountValue,
			rowNumber,
			"Credit/Debit Amount",
		);
		if (signedAmount === 0) {
			throw new BankCsvValidationError(
				`Row ${rowNumber}: Credit/Debit Amount must not be zero.`,
			);
		}
		const balance = get("Balance");
		if (balance) parseAmount(balance, rowNumber, "Balance");
		parsedTransactions.push({
			bookedAt,
			valueDate,
			description: text,
			signedAmount,
			sourceOrder: parsedTransactions.length,
		});
	}

	if (parsedTransactions.length === 0) {
		throw new BankCsvValidationError(
			"The CSV contains no usable transaction rows.",
		);
	}
	const months = new Set(
		parsedTransactions.map((transaction) => transaction.bookedAt.slice(0, 7)),
	);
	if (months.size !== 1) {
		throw new BankCsvValidationError(
			`The CSV spans multiple Booked At months (${[...months].sort().join(", ")}); import exactly one calendar month.`,
		);
	}
	const debits = parsedTransactions
		.filter(({ signedAmount }) => signedAmount < 0)
		.map(({ signedAmount, ...transaction }) => ({
			...transaction,
			amount: Math.abs(signedAmount),
		}));
	if (debits.length === 0) {
		throw new BankCsvValidationError(
			"The CSV contains no debit transactions to import.",
		);
	}
	const skippedCreditCount = parsedTransactions.length - debits.length;
	const warnings =
		skippedCreditCount > 0
			? [
					`${skippedCreditCount} positive credit row${skippedCreditCount === 1 ? " was" : "s were"} skipped; only negative debits will be imported.`,
				]
			: [];
	return {
		month: [...months][0],
		debits,
		skippedCreditCount,
		totalDebitAmount: Number(
			debits.reduce((total, debit) => total + debit.amount, 0).toFixed(2),
		),
		warnings,
	};
}
