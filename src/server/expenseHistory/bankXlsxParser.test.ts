import { describe, expect, test } from "bun:test";
import { utils, write } from "xlsx";
import { BankImportValidationError } from "./bankImportParser";
import { parseBankXlsx } from "./bankXlsxParser";

function workbookBase64(rows: unknown[][]) {
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), "Transactions");
	return write(workbook, { type: "base64", bookType: "xlsx" });
}

const metadataRows = [
	["Finanzassistent - Transaktionen"],
	[],
	["Heruntergeladen am", new Date("2026-07-18T11:08:00Z")],
	[],
	[
		"Datum",
		"Gegenpartei",
		"Betrag",
		"Währung",
		"Konto",
		"Kategorie",
		"Kontoinhaber",
		"Buchungstext",
		"Zahlungsinformationen",
		"Referenz",
		"Kommentar",
		"Stichworte",
	],
];

describe("Finanzassistent Excel parser", () => {
	test("supports the complete Finanzassistent category list", () => {
		const categoryMappings = [
			["Allgemeines", "Administrative"],
			["Apotheke & Drogerie", "Health & Wellbeing"],
			["Auto", "Transport"],
			["Bargeldbezug", "Cash Withdrawal"],
			["Dienstleistungen", "Services"],
			["Gastronomie", "Dining"],
			["Krankenversicherung", "Health & Wellbeing"],
			["Lebensmittel", "Groceries"],
			["Lohn", "Other Income"],
			["Miete & Hypothek", "Home"],
			["Möbel & Einrichtung", "Home"],
			["Persönliches", "Essentials"],
			["Reisen", "Travel"],
			["Shopping", "Shopping"],
			["Sparen & Anlegen", "Savings"],
			["Steuern", "Taxes"],
			["Unterhaltung", "Entertainment"],
			["Weitere Einnahmen", "Other Income"],
			["Zahlungen", "Payments"],
			["Ärzte & Pflegedienste", "Health & Wellbeing"],
			["Öffentlicher Verkehr", "Transport"],
		] as const;
		const parsed = parseBankXlsx(
			workbookBase64([
				...metadataRows,
				...categoryMappings.map(([sourceCategory], index) => [
					new Date("2026-07-01T00:00:00Z"),
					`Transaction ${index + 1}`,
					-(index + 1),
					"CHF",
					"Private account",
					sourceCategory,
					"Test User",
					"Purchase",
				]),
			]),
		);

		expect(parsed.months[0]?.debits.map(({ category }) => category)).toEqual(
			categoryMappings.map(([, category]) => category),
		);
	});

	test("finds the transaction table and translates categories to English", () => {
		const parsed = parseBankXlsx(
			workbookBase64([
				...metadataRows,
				[
					new Date("2026-07-17T00:00:00Z"),
					"Coop",
					-17.95,
					"CHF",
					"Private account",
					"Lebensmittel",
					"Test User",
					"Online Einkauf Coop",
				],
				[
					new Date("2026-07-17T00:00:00Z"),
					"Restaurant",
					-25,
					"CHF",
					"Private account",
					"Gastronomie",
					"Test User",
					"Restaurant payment",
				],
				[
					new Date("2026-07-17T00:00:00Z"),
					"Refund",
					10,
					"CHF",
					"Private account",
					"Weitere Einnahmen",
					"Test User",
					"Refund",
				],
				[
					new Date("2026-07-16T00:00:00Z"),
					"Landlord",
					-1200,
					"CHF",
					"Private account",
					"Miete & Hypothek",
					"Test User",
					"Monthly rent",
				],
				[
					new Date("2026-07-15T00:00:00Z"),
					"Hairdresser",
					-45,
					"CHF",
					"Private account",
					"Persönliches",
					"Test User",
					"Haircut",
				],
				[
					new Date("2026-07-14T00:00:00Z"),
					"Petrol station",
					-70,
					"CHF",
					"Private account",
					"Auto",
					"Test User",
					"Fuel",
				],
				[
					new Date("2026-07-13T00:00:00Z"),
					"Furniture store",
					-250,
					"CHF",
					"Private account",
					"Möbel & Einrichtung",
					"Test User",
					"Furniture",
				],
				[
					new Date("2026-07-12T00:00:00Z"),
					"Employer",
					5000,
					"CHF",
					"Private account",
					"Lohn",
					"Test User",
					"Salary",
				],
				[
					new Date("2026-07-11T00:00:00Z"),
					"Department store",
					-80,
					"CHF",
					"Private account",
					"Shopping",
					"Test User",
					"Purchase",
				],
				[
					new Date("2026-07-10T00:00:00Z"),
					"SBB",
					-32,
					"CHF",
					"Private account",
					"Öffentlicher Verkehr",
					"Test User",
					"Train ticket",
				],
			]),
		);

		expect(parsed.months).toHaveLength(1);
		expect(parsed.months[0]?.debits).toEqual([
			{
				bookedAt: "2026-07-17",
				valueDate: null,
				description: "Coop",
				amount: 17.95,
				sourceOrder: 0,
				category: "Groceries",
			},
			{
				bookedAt: "2026-07-17",
				valueDate: null,
				description: "Restaurant",
				amount: 25,
				sourceOrder: 1,
				category: "Dining",
			},
			{
				bookedAt: "2026-07-16",
				valueDate: null,
				description: "Landlord",
				amount: 1200,
				sourceOrder: 3,
				category: "Home",
			},
			{
				bookedAt: "2026-07-15",
				valueDate: null,
				description: "Hairdresser",
				amount: 45,
				sourceOrder: 4,
				category: "Essentials",
			},
			{
				bookedAt: "2026-07-14",
				valueDate: null,
				description: "Petrol station",
				amount: 70,
				sourceOrder: 5,
				category: "Transport",
			},
			{
				bookedAt: "2026-07-13",
				valueDate: null,
				description: "Furniture store",
				amount: 250,
				sourceOrder: 6,
				category: "Home",
			},
			{
				bookedAt: "2026-07-11",
				valueDate: null,
				description: "Department store",
				amount: 80,
				sourceOrder: 8,
				category: "Shopping",
			},
			{
				bookedAt: "2026-07-10",
				valueDate: null,
				description: "SBB",
				amount: 32,
				sourceOrder: 9,
				category: "Transport",
			},
		]);
		expect(parsed.skippedCreditCount).toBe(2);
	});

	test("rejects an unmapped category instead of silently losing it", () => {
		const input = workbookBase64([
			...metadataRows,
			[
				new Date("2026-07-17T00:00:00Z"),
				"Unknown",
				-10,
				"CHF",
				"Private account",
				"Neue Kategorie",
				"Test User",
				"Unknown category",
			],
		]);
		expect(() => parseBankXlsx(input)).toThrow(BankImportValidationError);
		expect(() => parseBankXlsx(input)).toThrow(
			'Kategorie "Neue Kategorie" has no English expense category mapping',
		);
	});
});
