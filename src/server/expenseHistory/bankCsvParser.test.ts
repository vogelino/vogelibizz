import { describe, expect, test } from "bun:test";
import { BankCsvValidationError, parseBankCsv } from "./bankCsvParser";

const validCsv = await Bun.file(
	new URL("fixtures/valid-synthetic.csv", import.meta.url),
).text();
const header = "IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date";

function expectValidationError(csv: string, message: string) {
	expect(() => parseBankCsv(csv)).toThrow(BankCsvValidationError);
	expect(() => parseBankCsv(csv)).toThrow(message);
}

describe("bank CSV parser", () => {
	test("normalizes dates and debits and joins continuation rows", () => {
		const parsed = parseBankCsv(validCsv);
		expect(parsed.month).toBe("2026-06");
		expect(parsed.debits).toEqual([
			{
				bookedAt: "2026-06-03",
				valueDate: "2026-06-04",
				description: "Synthetic market Weekly groceries",
				amount: 42.5,
				sourceOrder: 0,
			},
			{
				bookedAt: "2026-06-15",
				valueDate: null,
				description: "Synthetic transit",
				amount: 18.4,
				sourceOrder: 2,
			},
		]);
		expect(parsed.totalDebitAmount).toBe(60.9);
	});

	test("skips credits and returns a preview warning", () => {
		const parsed = parseBankCsv(validCsv);
		expect(parsed.skippedCreditCount).toBe(1);
		expect(parsed.warnings).toEqual([
			"1 positive credit row was skipped; only negative debits will be imported.",
		]);
	});

	test("rejects missing headers and empty content", () => {
		expectValidationError("Booked At;Text\n", "Missing required CSV headers");
		expectValidationError("", "The CSV is empty");
		expectValidationError(`${header}\n`, "no usable transaction rows");
	});

	test("rejects invalid dates and amounts", () => {
		expectValidationError(
			`${header}\nCH00;31.02.2026;Synthetic debit;-10;100;31.02.2026`,
			"not a valid calendar date",
		);
		expectValidationError(
			`${header}\nCH00;01.06.2026;Synthetic debit;ten;100;01.06.2026`,
			"not a valid CHF amount",
		);
		expectValidationError(
			`${header}\nCH00;01.06.2026;Synthetic debit;0;100;01.06.2026`,
			"must not be zero",
		);
	});

	test("rejects orphan continuations", () => {
		expectValidationError(
			`${header}\n;;Synthetic orphan;;;`,
			"has no preceding transaction",
		);
	});

	test("rejects files spanning multiple Booked At months", () => {
		expectValidationError(
			`${header}\nCH00;30.06.2026;Synthetic one;-10;100;30.06.2026\nCH00;01.07.2026;Synthetic two;-20;80;01.07.2026`,
			"spans multiple Booked At months (2026-06, 2026-07)",
		);
	});

	test("rejects a credit-only file with no usable debits", () => {
		expectValidationError(
			`${header}\nCH00;01.06.2026;Synthetic credit;10;100;01.06.2026`,
			"no debit transactions to import",
		);
	});
});
