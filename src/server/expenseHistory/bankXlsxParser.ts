import { read, SSF, utils } from "xlsx";
import {
	BankImportValidationError,
	groupParsedBankTransactions,
	type ImportedExpenseCategory,
	type ParsedBankImport,
	type ParsedBankTransaction,
} from "./bankImportParser";

const BANK_XLSX_HEADERS = [
	"Datum",
	"Gegenpartei",
	"Betrag",
	"Währung",
	"Kategorie",
	"Buchungstext",
] as const;

const translatedCategories = {
	Allgemeines: "Administrative",
	"Apotheke & Drogerie": "Health & Wellbeing",
	Auto: "Transport",
	Bargeldbezug: "Cash Withdrawal",
	Dienstleistungen: "Services",
	Gastronomie: "Dining",
	Krankenversicherung: "Health & Wellbeing",
	Lebensmittel: "Groceries",
	Lohn: "Other Income",
	"Miete & Hypothek": "Home",
	"Möbel & Einrichtung": "Home",
	"Öffentlicher Verkehr": "Transport",
	Persönliches: "Essentials",
	Reisen: "Travel",
	Shopping: "Shopping",
	"Sparen & Anlegen": "Savings",
	Steuern: "Taxes",
	Unterhaltung: "Entertainment",
	"Weitere Einnahmen": "Other Income",
	Zahlungen: "Payments",
	"Ärzte & Pflegedienste": "Health & Wellbeing",
} as const satisfies Record<string, ImportedExpenseCategory>;

function decodeBase64(value: string) {
	try {
		const binary = atob(value);
		return Uint8Array.from(binary, (character) => character.charCodeAt(0));
	} catch {
		throw new BankImportValidationError(
			"The Excel workbook is not valid base64.",
		);
	}
}

function normalizeExcelDate(value: unknown, rowNumber: number) {
	let year: number;
	let month: number;
	let day: number;
	if (value instanceof Date) {
		year = value.getUTCFullYear();
		month = value.getUTCMonth() + 1;
		day = value.getUTCDate();
	} else if (typeof value === "number") {
		const parsed = SSF.parse_date_code(value);
		if (!parsed) {
			throw new BankImportValidationError(
				`Row ${rowNumber}: Datum is not a valid Excel date.`,
			);
		}
		({ y: year, m: month, d: day } = parsed);
	} else if (typeof value === "string") {
		const trimmed = value.trim();
		const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
		const european = /^(\d{2})[./](\d{2})[./](\d{4})$/.exec(trimmed);
		if (iso) {
			[, year, month, day] = iso.map(Number);
		} else if (european) {
			[, day, month, year] = european.map(Number);
		} else {
			throw new BankImportValidationError(
				`Row ${rowNumber}: Datum is not a valid date.`,
			);
		}
	} else {
		throw new BankImportValidationError(`Row ${rowNumber}: Datum is required.`);
	}
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		throw new BankImportValidationError(
			`Row ${rowNumber}: Datum is not a valid calendar date.`,
		);
	}
	return `${year.toString().padStart(4, "0")}-${month
		.toString()
		.padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function normalizeAmount(value: unknown, rowNumber: number) {
	const amount =
		typeof value === "number"
			? value
			: typeof value === "string"
				? Number(
						value
							.trim()
							.replace(/[\s'’]/g, "")
							.replace(",", "."),
					)
				: Number.NaN;
	if (!Number.isFinite(amount) || amount === 0) {
		throw new BankImportValidationError(
			`Row ${rowNumber}: Betrag must be a non-zero number.`,
		);
	}
	return amount;
}

function normalizeText(value: unknown) {
	return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function parseBankXlsx(workbookBase64: string): ParsedBankImport {
	let workbook: ReturnType<typeof read>;
	try {
		workbook = read(decodeBase64(workbookBase64), {
			type: "array",
			cellDates: true,
		});
	} catch (error) {
		if (error instanceof BankImportValidationError) throw error;
		throw new BankImportValidationError(
			"The Excel workbook could not be read.",
		);
	}

	let rows: unknown[][] | undefined;
	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];
		if (!sheet) continue;
		const candidateRows = utils.sheet_to_json<unknown[]>(sheet, {
			header: 1,
			raw: true,
			defval: null,
		});
		if (
			candidateRows.some((row) =>
				BANK_XLSX_HEADERS.every((header) => row.includes(header)),
			)
		) {
			rows = candidateRows;
			break;
		}
	}
	if (!rows) {
		throw new BankImportValidationError(
			`The Excel workbook must contain these headers: ${BANK_XLSX_HEADERS.join(", ")}.`,
		);
	}

	const headerIndex = rows.findIndex((row) =>
		BANK_XLSX_HEADERS.every((header) => row.includes(header)),
	);
	const header = rows[headerIndex] ?? [];
	const indexes = Object.fromEntries(
		BANK_XLSX_HEADERS.map((name) => [name, header.indexOf(name)]),
	) as Record<(typeof BANK_XLSX_HEADERS)[number], number>;
	const transactions: ParsedBankTransaction[] = [];

	for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
		const row = rows[rowIndex] ?? [];
		if (row.every((cell) => cell === null || cell === "")) continue;
		const rowNumber = rowIndex + 1;
		const get = (name: (typeof BANK_XLSX_HEADERS)[number]) =>
			row[indexes[name]];
		const currency = normalizeText(get("Währung"));
		if (currency !== "CHF") {
			throw new BankImportValidationError(
				`Row ${rowNumber}: Währung must be CHF.`,
			);
		}
		const sourceCategory = normalizeText(get("Kategorie"));
		const category =
			translatedCategories[sourceCategory as keyof typeof translatedCategories];
		if (!category) {
			throw new BankImportValidationError(
				`Row ${rowNumber}: Kategorie "${sourceCategory || "(empty)"}" has no English expense category mapping.`,
			);
		}
		const counterparty = normalizeText(get("Gegenpartei"));
		const bookingText = normalizeText(get("Buchungstext"));
		const description = counterparty || bookingText;
		if (!description) {
			throw new BankImportValidationError(
				`Row ${rowNumber}: Gegenpartei or Buchungstext is required.`,
			);
		}
		transactions.push({
			bookedAt: normalizeExcelDate(get("Datum"), rowNumber),
			valueDate: null,
			description,
			signedAmount: normalizeAmount(get("Betrag"), rowNumber),
			sourceOrder: transactions.length,
			category,
		});
	}

	return groupParsedBankTransactions(transactions);
}
