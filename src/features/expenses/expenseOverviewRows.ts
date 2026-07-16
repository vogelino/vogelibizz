import type { ExpenseWithMonthlyCLPPriceType } from "@/db/schema";
import type { ExpenseOverviewSummary } from "@/utility/expenseHistoryContracts";

export const mixedClassification = "Mixed" as const;

export type ExpenseOverviewRow =
	| {
			kind: "recurring";
			id: number;
			expense: ExpenseWithMonthlyCLPPriceType;
			name: string;
			category: ExpenseWithMonthlyCLPPriceType["category"];
			type: ExpenseWithMonthlyCLPPriceType["type"];
			monthlyAmount: number;
			realMonthlyAverage: number | null;
			difference: number | null;
			last_modified: string;
	  }
	| {
			kind: "other";
			id: "other";
			expense: null;
			name: "Other expenses";
			category: typeof mixedClassification;
			type: typeof mixedClassification;
			monthlyAmount: number;
			realMonthlyAverage: number;
			difference: null;
			last_modified: null;
	  };

export type ExpenseOverviewCategory = ExpenseOverviewRow["category"];
export type ExpenseOverviewType = ExpenseOverviewRow["type"];

export function createExpenseOverviewRows(
	expenses: readonly ExpenseWithMonthlyCLPPriceType[],
	summary: ExpenseOverviewSummary | undefined,
): ExpenseOverviewRow[] {
	const averages = new Map(
		summary?.recurring.map((item) => [item.expenseId, item.monthlyAverage]) ??
			[],
	);
	const recurringRows: ExpenseOverviewRow[] = expenses.map((expense) => {
		const realMonthlyAverage = averages.get(expense.id) ?? null;
		return {
			kind: "recurring",
			id: expense.id,
			expense,
			name: expense.name,
			category: expense.category,
			type: expense.type,
			monthlyAmount: expense.clpMonthlyPrice,
			realMonthlyAverage,
			difference:
				realMonthlyAverage === null
					? null
					: expense.clpMonthlyPrice - realMonthlyAverage,
			last_modified: expense.last_modified,
		};
	});

	if (!summary?.other) return recurringRows;
	return [
		...recurringRows,
		{
			kind: "other",
			id: "other",
			expense: null,
			name: "Other expenses",
			category: mixedClassification,
			type: mixedClassification,
			monthlyAmount: summary.other.monthlyAverage,
			realMonthlyAverage: summary.other.monthlyAverage,
			difference: null,
			last_modified: null,
		},
	];
}

export function filterExpenseOverviewRows(
	rows: readonly ExpenseOverviewRow[],
	categories: readonly ExpenseOverviewCategory[],
	type: ExpenseOverviewType | "All types",
) {
	return rows.filter(
		(row) =>
			(categories.length === 0 || categories.includes(row.category)) &&
			(type === "All types" || row.type === type),
	);
}

export function totalMonthlyAmount(rows: readonly ExpenseOverviewRow[]) {
	return rows.reduce((total, row) => total + row.monthlyAmount, 0);
}

export function totalsByClassification(
	rows: readonly ExpenseOverviewRow[],
	getClassification: (row: ExpenseOverviewRow) => string,
	requestedClassifications?: readonly string[],
) {
	const totals = new Map<string, number>();
	for (const classification of requestedClassifications ?? []) {
		totals.set(classification, 0);
	}
	for (const row of rows) {
		const classification = getClassification(row);
		if (requestedClassifications && !totals.has(classification)) continue;
		totals.set(
			classification,
			(totals.get(classification) ?? 0) + row.monthlyAmount,
		);
	}
	return [...totals.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value);
}

export function limitChartSeries(
	series: readonly { label: string; value: number }[],
	limit = 4,
) {
	if (series.length <= limit) return [...series];
	const mixed = series.find(({ label }) => label === mixedClassification);
	if (!mixed || series.slice(0, limit).includes(mixed)) {
		return series.slice(0, limit);
	}
	return [
		...series
			.filter(({ label }) => label !== mixedClassification)
			.slice(0, Math.max(0, limit - 1)),
		mixed,
	];
}
