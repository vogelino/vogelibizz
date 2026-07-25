import { describe, expect, test } from "bun:test";
import type { ExpenseWithMonthlyCLPPriceType } from "@/db/schema";
import type { ExpenseOverviewSummary } from "@/utility/expenseHistoryContracts";
import {
	createExpenseOverviewRows,
	filterExpenseOverviewRows,
	getRealMonthlyAverageStatus,
	limitChartSeries,
	mixedClassification,
	totalMonthlyAmount,
	totalsByClassification,
} from "./expenseOverviewRows";

const expense: ExpenseWithMonthlyCLPPriceType = {
	id: 1,
	created_at: "2026-07-16T10:00:00.000Z",
	last_modified: "2026-07-16T10:00:00.000Z",
	name: "Rent",
	category: "Home",
	type: "Personal",
	rate: "Monthly",
	originalPrice: 100,
	originalCurrency: "CHF",
	clpMonthlyPrice: 100,
};

const summary: ExpenseOverviewSummary = {
	currency: "CHF",
	importedMonthCount: 2,
	configuredMonthlyTotal: 100,
	recurring: [{ expenseId: 1, total: 160, monthlyAverage: 80 }],
	other: { total: 50, monthlyAverage: 25 },
	livingCostEstimate: 125,
	observedMonthlyAverage: 105,
};

describe("expense overview rows", () => {
	test("adds calculated values and a non-recurring Mixed Other row", () => {
		const rows = createExpenseOverviewRows([expense], summary);
		expect(rows).toEqual([
			{
				kind: "other",
				id: "other",
				expense: null,
				name: "Other expenses",
				category: "Mixed",
				type: "Mixed",
				monthlyAmount: 25,
				realMonthlyAverage: 25,
				difference: null,
				last_modified: null,
			},
			expect.objectContaining({
				kind: "recurring",
				monthlyAmount: 100,
				realMonthlyAverage: 80,
				difference: 20,
			}),
		]);
		expect(totalMonthlyAmount(rows)).toBe(summary.livingCostEstimate ?? 0);
	});

	test("omits Other and leaves actual comparisons unavailable without imports", () => {
		const rows = createExpenseOverviewRows([expense], {
			...summary,
			importedMonthCount: 0,
			recurring: [{ expenseId: 1, total: 0, monthlyAverage: null }],
			other: null,
			livingCostEstimate: null,
			observedMonthlyAverage: null,
		});
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			realMonthlyAverage: null,
			difference: null,
		});
	});

	test("classifies real monthly averages relative to the expected amount", () => {
		expect(getRealMonthlyAverageStatus(100, 105)).toBe("as-expected");
		expect(getRealMonthlyAverageStatus(100, 95)).toBe("as-expected");
		expect(getRealMonthlyAverageStatus(100, 105.01)).toBe("overpaid");
		expect(getRealMonthlyAverageStatus(100, 94.99)).toBe("underpaid");
		expect(getRealMonthlyAverageStatus(100, 100)).toBe("as-expected");
		expect(getRealMonthlyAverageStatus(23.9, 23.900000000000002)).toBe(
			"as-expected",
		);
		expect(getRealMonthlyAverageStatus(0, 0)).toBe("as-expected");
		expect(getRealMonthlyAverageStatus(0, 0.01)).toBe("overpaid");
		expect(getRealMonthlyAverageStatus(100, null)).toBe("unavailable");
	});

	test("filters and pie classifications include Other only when Mixed applies", () => {
		const rows = createExpenseOverviewRows([expense], summary);
		expect(
			filterExpenseOverviewRows(rows, [mixedClassification], "All types"),
		).toHaveLength(1);
		expect(filterExpenseOverviewRows(rows, ["Home"], "Personal")).toEqual([
			rows[1],
		]);
		expect(totalsByClassification(rows, (row) => row.category)).toEqual([
			{ label: "Home", value: 100 },
			{ label: "Mixed", value: 25 },
		]);
	});

	test("keeps Mixed visible when a chart limits its segments", () => {
		expect(
			limitChartSeries([
				{ label: "A", value: 50 },
				{ label: "B", value: 40 },
				{ label: "C", value: 30 },
				{ label: "D", value: 20 },
				{ label: "Mixed", value: 10 },
			]),
		).toEqual([
			{ label: "A", value: 50 },
			{ label: "B", value: 40 },
			{ label: "C", value: 30 },
			{ label: "Mixed", value: 10 },
		]);
	});
});
