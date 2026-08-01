import { describe, expect, test } from "bun:test";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { getSavingsWins } from "./savingsWins";

const dashboard = {
	configuredMonthlySavings: 200,
	months: [
		{ month: "2025-12", savings: 300 },
		{ month: "2026-01", savings: 0 },
		{ month: "2026-02", savings: 100 },
		{ month: "2026-03", savings: 250 },
	],
} as ExpenseDashboard;

describe("getSavingsWins", () => {
	test("celebrates the selected month without using future months", () => {
		expect(getSavingsWins(dashboard, "2026-03")).toEqual({
			currentSavings: 250,
			monthlyGoal: 200,
			streak: 2,
			lastYearTotal: 650,
			savingMonthCount: 3,
			isPersonalBest: false,
		});

		expect(getSavingsWins(dashboard, "2026-02")).toMatchObject({
			currentSavings: 100,
			streak: 1,
			lastYearTotal: 400,
			savingMonthCount: 2,
			isPersonalBest: false,
		});
	});

	test("recognises a first saving month as a personal best", () => {
		expect(getSavingsWins(dashboard, "2025-12")).toMatchObject({
			streak: 1,
			isPersonalBest: true,
		});
	});
});
