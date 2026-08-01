import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

export type SavingsWins = {
	currentSavings: number;
	monthlyGoal: number;
	streak: number;
	lastYearTotal: number;
	savingMonthCount: number;
	isPersonalBest: boolean;
};

export function getSavingsWins(
	dashboard: ExpenseDashboard,
	selectedMonth: string,
): SavingsWins {
	const currentIndex = dashboard.months.findIndex(
		({ month }) => month === selectedMonth,
	);
	if (currentIndex < 0) {
		return {
			currentSavings: 0,
			monthlyGoal: dashboard.configuredMonthlySavings,
			streak: 0,
			lastYearTotal: 0,
			savingMonthCount: 0,
			isPersonalBest: false,
		};
	}

	const currentSavings = dashboard.months[currentIndex].savings;
	const previousBest = dashboard.months
		.slice(0, currentIndex)
		.reduce((best, month) => Math.max(best, month.savings), 0);
	const lastYear = dashboard.months.slice(
		Math.max(0, currentIndex - 11),
		currentIndex + 1,
	);
	let streak = 0;
	for (let index = currentIndex; index >= 0; index -= 1) {
		if (dashboard.months[index].savings <= 0) break;
		streak += 1;
	}

	return {
		currentSavings,
		monthlyGoal: dashboard.configuredMonthlySavings,
		streak,
		lastYearTotal: lastYear.reduce((total, month) => total + month.savings, 0),
		savingMonthCount: lastYear.filter(({ savings }) => savings > 0).length,
		isPersonalBest: currentSavings > 0 && currentSavings > previousBest,
	};
}
