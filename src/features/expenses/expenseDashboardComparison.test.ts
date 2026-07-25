import { describe, expect, test } from "bun:test";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { getExpenseDashboardComparisonView } from "./expenseDashboardComparison";

const month = (
	key: string,
	total: number,
	dining: number,
	software: number,
): ExpenseDashboard["months"][number] => ({
	month: key,
	total,
	matched: software,
	unmatched: dining,
	unmatchedCount: dining > 0 ? 1 : 0,
	uncategorizedCount: 0,
	reviewCount: dining > 0 ? 1 : 0,
	categories: [
		{
			category: "Dining" as const,
			total: dining,
			transactionCount: dining > 0 ? 1 : 0,
		},
		{
			category: "Software" as const,
			total: software,
			transactionCount: software > 0 ? 1 : 0,
		},
	].filter(({ total: categoryTotal }) => categoryTotal > 0),
});

const dashboard = {
	months: [
		month("2025-03", 80, 50, 30),
		month("2026-01", 100, 70, 30),
		month("2026-02", 140, 100, 40),
		month("2026-03", 200, 150, 50),
	],
	recurring: [
		{
			expenseId: 1,
			name: "Cloud",
			category: "Software",
			plannedMonthly: 40,
			actualMonthlyAverage: 37.5,
			difference: -2.5,
			monthlyActuals: [
				{ month: "2025-03", total: 30, transactionCount: 1 },
				{ month: "2026-01", total: 30, transactionCount: 1 },
				{ month: "2026-02", total: 40, transactionCount: 1 },
				{ month: "2026-03", total: 50, transactionCount: 1 },
			],
		},
	],
} as ExpenseDashboard;

describe("getExpenseDashboardComparisonView", () => {
	test("compares one month with the trailing average without including itself", () => {
		const view = getExpenseDashboardComparisonView(dashboard, "2026-03", "3m");
		expect(view).toMatchObject({
			baselineTotal: (80 + 100 + 140) / 3,
			difference: 200 - (80 + 100 + 140) / 3,
			expectedRecurringRemaining: 0,
			committedOutlook: 200,
		});
		expect(view?.baselineMonths.map(({ month: key }) => key)).toEqual([
			"2025-03",
			"2026-01",
			"2026-02",
		]);
		expect(view?.categoryComparisons[0]).toMatchObject({
			category: "Dining",
			currentTotal: 150,
			baselineTotal: (50 + 70 + 100) / 3,
		});
	});

	test("uses the matching calendar month for year-over-year comparison", () => {
		const view = getExpenseDashboardComparisonView(
			dashboard,
			"2026-03",
			"year",
		);
		expect(view?.baselineMonths.map(({ month: key }) => key)).toEqual([
			"2025-03",
		]);
		expect(view?.baselineTotal).toBe(80);
	});

	test("shows recurring spending that is still expected", () => {
		const view = getExpenseDashboardComparisonView(
			dashboard,
			"2026-02",
			"previous",
		);
		expect(view?.expectedRecurringRemaining).toBe(0);
		expect(view?.recurringComparisons[0]).toMatchObject({
			currentActual: 40,
			currentTransactionCount: 1,
			baselineActual: 30,
			differenceFromPlan: 0,
		});
	});
});
