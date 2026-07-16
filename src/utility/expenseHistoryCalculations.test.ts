import { describe, expect, test } from "bun:test";
import { calculateExpenseHistorySummary } from "./expenseHistoryCalculations";

describe("calculateExpenseHistorySummary", () => {
	test("uses every imported month, including zero-spend months, and ignores calendar gaps", () => {
		const summary = calculateExpenseHistorySummary({
			importedMonths: [{ id: 10 }, { id: 20 }, { id: 30 }],
			configuredExpenses: [
				{ expenseId: 1, monthlyAmount: 100 },
				{ expenseId: 2, monthlyAmount: 25 },
			],
			transactions: [
				{ expenseMonthId: 10, expenseId: 1, amount: 90 },
				{ expenseMonthId: 20, expenseId: 1, amount: 120 },
				{ expenseMonthId: 10, expenseId: 2, amount: 30 },
				{ expenseMonthId: 30, expenseId: null, amount: 60 },
			],
		});

		expect(summary).toEqual({
			importedMonthCount: 3,
			configuredMonthlyTotal: 125,
			recurring: [
				{ expenseId: 1, total: 210, monthlyAverage: 70 },
				{ expenseId: 2, total: 30, monthlyAverage: 10 },
			],
			other: { total: 60, monthlyAverage: 20 },
			livingCostEstimate: 145,
			observedMonthlyAverage: 100,
		});
	});

	test("moves a deleted expense into Other without changing observed spending", () => {
		const importedMonths = [{ id: 1 }, { id: 2 }];
		const beforeDeletion = calculateExpenseHistorySummary({
			importedMonths,
			configuredExpenses: [{ expenseId: 9, monthlyAmount: 40 }],
			transactions: [
				{ expenseMonthId: 1, expenseId: 9, amount: 35 },
				{ expenseMonthId: 2, expenseId: null, amount: 15 },
			],
		});
		const afterDeletion = calculateExpenseHistorySummary({
			importedMonths,
			configuredExpenses: [],
			transactions: [
				{ expenseMonthId: 1, expenseId: null, amount: 35 },
				{ expenseMonthId: 2, expenseId: null, amount: 15 },
			],
		});

		expect(beforeDeletion.recurring[0]?.monthlyAverage).toBe(17.5);
		expect(beforeDeletion.other?.monthlyAverage).toBe(7.5);
		expect(afterDeletion.recurring).toEqual([]);
		expect(afterDeletion.other?.monthlyAverage).toBe(25);
		expect(afterDeletion.observedMonthlyAverage).toBe(
			beforeDeletion.observedMonthlyAverage,
		);
	});

	test("returns unavailable actual values when there are no imported months", () => {
		const summary = calculateExpenseHistorySummary({
			importedMonths: [],
			configuredExpenses: [{ expenseId: 1, monthlyAmount: 100 }],
			transactions: [],
		});

		expect(summary).toEqual({
			importedMonthCount: 0,
			configuredMonthlyTotal: 100,
			recurring: [{ expenseId: 1, total: 0, monthlyAverage: null }],
			other: null,
			livingCostEstimate: null,
			observedMonthlyAverage: null,
		});
	});

	test("rejects inconsistent inputs rather than producing misleading totals", () => {
		expect(() =>
			calculateExpenseHistorySummary({
				importedMonths: [{ id: 1 }],
				configuredExpenses: [],
				transactions: [{ expenseMonthId: 2, expenseId: null, amount: 10 }],
			}),
		).toThrow("unknown imported month");
		expect(() =>
			calculateExpenseHistorySummary({
				importedMonths: [{ id: 1 }],
				configuredExpenses: [],
				transactions: [{ expenseMonthId: 1, expenseId: null, amount: -1 }],
			}),
		).toThrow("finite, non-negative");
	});
});
