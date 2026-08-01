import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

export const expenseDashboardComparisonValues = [
	"previous",
	"3m",
	"6m",
	"12m",
	"year",
] as const;

export type ExpenseDashboardComparison =
	(typeof expenseDashboardComparisonValues)[number];

type DashboardMonth = ExpenseDashboard["months"][number];
type DashboardCategory = DashboardMonth["categories"][number];

export type ExpenseDashboardCategoryComparison = {
	category: DashboardCategory["category"];
	currentTotal: number;
	baselineTotal: number;
	difference: number;
	transactionCount: number;
};

export type ExpenseDashboardRecurringComparison = {
	expenseId: number;
	name: string;
	category: ExpenseDashboard["recurring"][number]["category"];
	rate: ExpenseDashboard["recurring"][number]["rate"];
	expectedThisMonth: number;
	expectation: "due" | "not-due" | "unknown" | "one-time";
	currentActual: number;
	currentTransactionCount: number;
	baselineActual: number;
	differenceFromPlan: number | null;
};

export type ExpenseDashboardComparisonView = {
	current: DashboardMonth;
	previousMonth: string | null;
	nextMonth: string | null;
	baselineMonths: DashboardMonth[];
	baselineLabel: string;
	baselineTotal: number | null;
	difference: number | null;
	percentageDifference: number | null;
	categoryComparisons: ExpenseDashboardCategoryComparison[];
	recurringComparisons: ExpenseDashboardRecurringComparison[];
	recurringPlanVariance: number;
	expectedRecurringRemaining: number;
	committedOutlook: number;
};

function average(values: readonly number[]): number | null {
	if (values.length === 0) return null;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function monthOneYearEarlier(month: string) {
	const [year, monthNumber] = month.split("-");
	return `${Number(year) - 1}-${monthNumber}`;
}

function monthDistance(from: string, to: string) {
	const [fromYear, fromMonth] = from.split("-").map(Number);
	const [toYear, toMonth] = to.split("-").map(Number);
	return (toYear - fromYear) * 12 + toMonth - fromMonth;
}

function billingIntervalMonths(
	rate: ExpenseDashboard["recurring"][number]["rate"],
): number | null {
	switch (rate) {
		case "Bi-Monthly":
			return 2;
		case "Quarterly":
			return 3;
		case "Semester":
			return 6;
		case "Yearly":
			return 12;
		case "Bi-Yearly":
			return 24;
		case "Tri-Yearly":
			return 36;
		case "One-time":
			return null;
		default:
			return 1;
	}
}

export function getExpenseDashboardComparisonView(
	dashboard: ExpenseDashboard,
	selectedMonth: string | undefined,
	comparison: ExpenseDashboardComparison,
): ExpenseDashboardComparisonView | null {
	const currentIndex =
		selectedMonth === undefined
			? dashboard.months.length - 1
			: dashboard.months.findIndex(({ month }) => month === selectedMonth);
	if (currentIndex < 0) return null;

	const current = dashboard.months[currentIndex];
	const earlierMonths = dashboard.months.slice(0, currentIndex);
	const requestedCount =
		comparison === "previous"
			? 1
			: comparison === "3m"
				? 3
				: comparison === "6m"
					? 6
					: comparison === "12m"
						? 12
						: null;
	const baselineMonths =
		requestedCount === null
			? dashboard.months.filter(
					({ month }) => month === monthOneYearEarlier(current.month),
				)
			: earlierMonths.slice(-requestedCount);
	const baselineTotal = average(baselineMonths.map(({ total }) => total));
	const difference =
		baselineTotal === null ? null : current.total - baselineTotal;
	const percentageDifference =
		difference === null || baselineTotal === null || baselineTotal === 0
			? null
			: (difference / baselineTotal) * 100;

	const currentCategories = new Map(
		current.categories.map((item) => [item.category, item]),
	);
	const baselineCategoryTotals = new Map<
		DashboardCategory["category"],
		number
	>();
	for (const month of baselineMonths) {
		for (const item of month.categories) {
			baselineCategoryTotals.set(
				item.category,
				(baselineCategoryTotals.get(item.category) ?? 0) + item.total,
			);
		}
	}
	const categories = new Set([
		...currentCategories.keys(),
		...baselineCategoryTotals.keys(),
	]);
	const categoryComparisons = [...categories]
		.map((category) => {
			const currentItem = currentCategories.get(category);
			const baselineCategoryTotal =
				baselineMonths.length === 0
					? 0
					: (baselineCategoryTotals.get(category) ?? 0) / baselineMonths.length;
			const currentTotal = currentItem?.total ?? 0;
			return {
				category,
				currentTotal,
				baselineTotal: baselineCategoryTotal,
				difference: currentTotal - baselineCategoryTotal,
				transactionCount: currentItem?.transactionCount ?? 0,
			};
		})
		.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

	const recurringComparisons = dashboard.recurring
		.map((expense) => {
			const actualByMonth = new Map(
				expense.monthlyActuals.map((actual) => [actual.month, actual]),
			);
			const currentActualRow = actualByMonth.get(current.month);
			const currentActual = currentActualRow?.total ?? 0;
			const baselineActual =
				average(
					baselineMonths.map(
						({ month }) => actualByMonth.get(month)?.total ?? 0,
					),
				) ?? 0;
			const intervalMonths = billingIntervalMonths(expense.rate);
			const anchorMonth = expense.monthlyActuals[0]?.month;
			const expectation: ExpenseDashboardRecurringComparison["expectation"] =
				expense.rate === "One-time"
					? currentActual > 0
						? "one-time"
						: "not-due"
					: intervalMonths === 1
						? "due"
						: anchorMonth === undefined
							? "unknown"
							: Math.abs(monthDistance(anchorMonth, current.month)) %
										(intervalMonths ?? 1) ===
									0
								? "due"
								: "not-due";
			const expectedThisMonth =
				expectation === "due"
					? intervalMonths === 1
						? expense.plannedMonthly
						: expense.plannedCharge
					: expectation === "one-time"
						? expense.plannedCharge
						: 0;
			const differenceFromPlan =
				expectation === "unknown" || expectation === "not-due"
					? null
					: intervalMonths === null
						? currentActual - expectedThisMonth
						: currentActual / intervalMonths - expense.plannedMonthly;
			return {
				expenseId: expense.expenseId,
				name: expense.name,
				category: expense.category,
				rate: expense.rate,
				expectedThisMonth,
				expectation,
				currentActual,
				currentTransactionCount: currentActualRow?.transactionCount ?? 0,
				baselineActual,
				differenceFromPlan,
			};
		})
		.sort(
			(a, b) =>
				Math.abs(b.differenceFromPlan ?? 0) -
				Math.abs(a.differenceFromPlan ?? 0),
		);
	const expectedRecurringRemaining = recurringComparisons.reduce(
		(total, expense) =>
			total + Math.max(0, expense.expectedThisMonth - expense.currentActual),
		0,
	);
	const recurringPlanVariance = recurringComparisons.reduce(
		(total, expense) => total + (expense.differenceFromPlan ?? 0),
		0,
	);

	const baselineLabel =
		comparison === "previous"
			? "previous imported month"
			: comparison === "year"
				? "same month last year"
				: `previous ${comparison.slice(0, -1)}-month average`;

	return {
		current,
		previousMonth: dashboard.months[currentIndex - 1]?.month ?? null,
		nextMonth: dashboard.months[currentIndex + 1]?.month ?? null,
		baselineMonths,
		baselineLabel,
		baselineTotal,
		difference,
		percentageDifference,
		categoryComparisons,
		recurringComparisons,
		recurringPlanVariance,
		expectedRecurringRemaining,
		committedOutlook: current.total + expectedRecurringRemaining,
	};
}
