import { describe, expect, test } from "bun:test";
import { calculateExpenseDashboard } from "./expenseDashboardCalculations";

describe("calculateExpenseDashboard", () => {
	test("summarizes months, category distribution, review counts, and recurring differences", () => {
		const dashboard = calculateExpenseDashboard({
			currency: "CHF",
			importedMonths: [
				{ id: 1, month: "2026-05" },
				{ id: 2, month: "2026-06" },
			],
			configuredExpenses: [
				{
					expenseId: 10,
					name: "Cloud storage",
					category: "Software",
					rate: "Monthly",
					plannedMonthly: 10,
					plannedCharge: 10,
				},
			],
			transactions: [
				{
					expenseMonthId: 1,
					expenseId: 10,
					amount: 10,
					category: "Software",
				},
				{
					expenseMonthId: 1,
					expenseId: null,
					amount: 30,
					category: "Dining",
				},
				{
					expenseMonthId: 2,
					expenseId: 10,
					amount: 12,
					category: "Software",
				},
				{
					expenseMonthId: 2,
					expenseId: null,
					amount: 8,
					category: null,
				},
			],
		});

		expect(dashboard.typicalMonthlyTotal).toBe(30);
		expect(dashboard.configuredMonthlyTotal).toBe(10);
		expect(dashboard.months.map(({ total }) => total)).toEqual([40, 20]);
		expect(dashboard.months[1]).toMatchObject({
			unmatchedCount: 1,
			uncategorizedCount: 1,
			reviewCount: 1,
		});
		expect(dashboard.latest).toMatchObject({
			month: "2026-06",
			total: 20,
			previousTotal: 40,
			matched: 12,
			unmatched: 8,
			unmatchedCount: 1,
			uncategorizedTotal: 8,
			uncategorizedCount: 1,
			reviewCount: 1,
		});
		expect(dashboard.latest?.categories).toEqual([
			{ category: "Software", total: 12, transactionCount: 1 },
			{ category: null, total: 8, transactionCount: 1 },
		]);
		expect(dashboard.recurring[0]).toMatchObject({
			expenseId: 10,
			actualMonthlyAverage: 11,
			difference: 1,
			monthlyActuals: [
				{ month: "2026-05", total: 10, transactionCount: 1 },
				{ month: "2026-06", total: 12, transactionCount: 1 },
			],
		});
	});

	test("returns an empty dashboard without imported months", () => {
		const dashboard = calculateExpenseDashboard({
			currency: "CHF",
			importedMonths: [],
			transactions: [],
			configuredExpenses: [
				{
					expenseId: 10,
					name: "Cloud storage",
					category: "Software",
					rate: "Yearly",
					plannedMonthly: 10,
					plannedCharge: 120,
				},
			],
		});

		expect(dashboard.latest).toBeNull();
		expect(dashboard.typicalMonthlyTotal).toBeNull();
		expect(dashboard.recurring[0].actualMonthlyAverage).toBeNull();
		expect(dashboard.recurring[0].monthlyActuals).toEqual([]);
	});
});
