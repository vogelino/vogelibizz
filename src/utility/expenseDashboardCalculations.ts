import type { expenseCategoryEnum } from "@/db/schema";
import type { ExpenseDashboard } from "./expenseHistoryContracts";

type ExpenseCategory = (typeof expenseCategoryEnum.enumValues)[number];

export type DashboardMonthInput = {
	id: number;
	month: string;
};

export type DashboardTransactionInput = {
	expenseMonthId: number;
	expenseId: number | null;
	amount: number;
	category: ExpenseCategory | null;
};

export type DashboardExpenseInput = {
	expenseId: number;
	name: string;
	category: ExpenseCategory;
	plannedMonthly: number;
};

export function calculateExpenseDashboard({
	currency,
	importedMonths,
	transactions,
	configuredExpenses,
}: {
	currency: ExpenseDashboard["currency"];
	importedMonths: readonly DashboardMonthInput[];
	transactions: readonly DashboardTransactionInput[];
	configuredExpenses: readonly DashboardExpenseInput[];
}): ExpenseDashboard {
	const monthById = new Map(
		importedMonths.map((month) => [
			month.id,
			{
				month: month.month,
				total: 0,
				matched: 0,
				unmatched: 0,
				unmatchedCount: 0,
				uncategorizedTotal: 0,
				uncategorizedCount: 0,
				reviewCount: 0,
				categoryTotals: new Map<
					ExpenseCategory | null,
					{ total: number; transactionCount: number }
				>(),
			},
		]),
	);
	const actualByExpenseId = new Map(
		configuredExpenses.map((expense) => [expense.expenseId, 0]),
	);

	for (const transaction of transactions) {
		const month = monthById.get(transaction.expenseMonthId);
		if (!month) continue;
		if (!Number.isFinite(transaction.amount) || transaction.amount < 0) {
			throw new Error("Dashboard transaction amounts must be non-negative");
		}

		month.total += transaction.amount;
		if (transaction.expenseId === null) {
			month.unmatched += transaction.amount;
			month.unmatchedCount += 1;
		} else {
			month.matched += transaction.amount;
			actualByExpenseId.set(
				transaction.expenseId,
				(actualByExpenseId.get(transaction.expenseId) ?? 0) +
					transaction.amount,
			);
		}
		if (transaction.category === null) {
			month.uncategorizedTotal += transaction.amount;
			month.uncategorizedCount += 1;
		}
		if (transaction.expenseId === null || transaction.category === null) {
			month.reviewCount += 1;
		}

		const category = month.categoryTotals.get(transaction.category) ?? {
			total: 0,
			transactionCount: 0,
		};
		category.total += transaction.amount;
		category.transactionCount += 1;
		month.categoryTotals.set(transaction.category, category);
	}

	const categoryRows = (
		categoryTotals: Map<
			ExpenseCategory | null,
			{ total: number; transactionCount: number }
		>,
	) =>
		[...categoryTotals.entries()]
			.map(([category, values]) => ({ category, ...values }))
			.filter(({ total }) => total > 0)
			.sort((a, b) => b.total - a.total);

	const sortedMonths = [...monthById.values()].sort((a, b) =>
		a.month.localeCompare(b.month),
	);
	const months = sortedMonths.map((month) => ({
		month: month.month,
		total: month.total,
		matched: month.matched,
		unmatched: month.unmatched,
		categories: categoryRows(month.categoryTotals),
	}));
	const latestSource = sortedMonths.at(-1);
	const previousSource = sortedMonths.at(-2);
	const totals = sortedMonths.map(({ total }) => total).sort((a, b) => a - b);
	const middle = Math.floor(totals.length / 2);
	const typicalMonthlyTotal =
		totals.length === 0
			? null
			: totals.length % 2 === 0
				? (totals[middle - 1] + totals[middle]) / 2
				: totals[middle];
	const importedMonthCount = importedMonths.length;

	return {
		currency,
		importedMonthCount,
		configuredMonthlyTotal: configuredExpenses.reduce(
			(total, expense) => total + expense.plannedMonthly,
			0,
		),
		typicalMonthlyTotal,
		months,
		latest: latestSource
			? {
					month: latestSource.month,
					total: latestSource.total,
					previousTotal: previousSource?.total ?? null,
					matched: latestSource.matched,
					unmatched: latestSource.unmatched,
					unmatchedCount: latestSource.unmatchedCount,
					uncategorizedTotal: latestSource.uncategorizedTotal,
					uncategorizedCount: latestSource.uncategorizedCount,
					reviewCount: latestSource.reviewCount,
					categories: categoryRows(latestSource.categoryTotals),
				}
			: null,
		recurring: configuredExpenses
			.map((expense) => {
				const actualTotal = actualByExpenseId.get(expense.expenseId) ?? 0;
				const actualMonthlyAverage =
					importedMonthCount === 0 ? null : actualTotal / importedMonthCount;
				return {
					...expense,
					actualMonthlyAverage,
					difference:
						actualMonthlyAverage === null
							? null
							: actualMonthlyAverage - expense.plannedMonthly,
				};
			})
			.sort(
				(a, b) => Math.abs(b.difference ?? 0) - Math.abs(a.difference ?? 0),
			),
	};
}
