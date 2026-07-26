"use client";

import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Route } from "@/routes/_resource/expenses/dashboard";
import useExpenseDashboard from "@/utility/data/useExpenseDashboard";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../ExpenseHistoryPresentation";
import { DashboardCategoryDistribution } from "./components/category-distribution";
import { DashboardKeyMetrics } from "./components/DashboardKeyMetrics";
import { DashboardSection } from "./components/DashboardSection";
import { MonthlySpendingTrend } from "./components/MonthlySpendingTrend";
import {
	type ExpenseDashboardComparison,
	getExpenseDashboardComparisonView,
} from "./expenseDashboardComparison";
import {
	getExpenseCategoryColor,
	getExpenseCategoryLabel,
} from "./expenseDashboardPresentation";

const comparisonOptions: {
	value: ExpenseDashboardComparison;
	label: string;
}[] = [
	{ value: "previous", label: "Previous month" },
	{ value: "3m", label: "Previous 3-month average" },
	{ value: "6m", label: "Previous 6-month average" },
	{ value: "12m", label: "Previous 12-month average" },
	{ value: "year", label: "Same month last year" },
];

function signedCurrency(value: number, currency: ExpenseDashboard["currency"]) {
	if (value === 0) return formatCurrency(0, currency);
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value), currency)}`;
}

export default function ExpenseDashboardPage() {
	const dashboardQuery = useExpenseDashboard();
	const search = Route.useSearch();
	const dashboard = dashboardQuery.data;
	const comparison = search.compare ?? "3m";
	const view = useMemo(
		() =>
			dashboard
				? getExpenseDashboardComparisonView(dashboard, search.month, comparison)
				: null,
		[comparison, dashboard, search.month],
	);

	const navigate = useNavigate({ from: Route.fullPath });
	const setMonth = (month: string | null) =>
		navigate({
			search: (previous) => ({
				...previous,
				month:
					month === dashboard?.months.at(-1)?.month
						? undefined
						: (month ?? undefined),
			}),
			replace: true,
		});

	const openHistory = (
		category?: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) => {
		if (!view) return;
		navigate({
			to: "/expenses/history",
			search: {
				month: view.current.month,
				category: category ? [category] : undefined,
				uncategorizedOnly: category === null ? true : undefined,
			},
		});
	};
	const openBaselineHistory = (
		category?: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) => {
		const firstMonth = view?.baselineMonths[0]?.month;
		const lastMonth = view?.baselineMonths.at(-1)?.month;
		if (!firstMonth || !lastMonth) return;
		navigate({
			to: "/expenses/history",
			search: {
				month: firstMonth === lastMonth ? firstMonth : undefined,
				fromMonth: firstMonth === lastMonth ? undefined : firstMonth,
				toMonth: firstMonth === lastMonth ? undefined : lastMonth,
				category: category ? [category] : undefined,
				uncategorizedOnly: category === null ? true : undefined,
			},
		});
	};

	if (dashboardQuery.isPending) {
		return (
			<div className="space-y-10 px-6 py-6 md:px-10">
				<div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
					{["spent", "expected", "outlook", "review"].map((key) => (
						<Skeleton key={key} className="h-28" />
					))}
				</div>
				<Skeleton className="h-96" />
			</div>
		);
	}
	if (dashboardQuery.error) {
		return (
			<div className="px-6 py-12 text-center md:px-10">
				<h2 className="font-semibold">The dashboard could not be loaded</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					{dashboardQuery.error.message}
				</p>
			</div>
		);
	}
	if (!dashboard || !view) {
		return (
			<div className="px-6 py-12 text-center md:px-10">
				<h2 className="font-semibold">No spending history yet</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Import a bank export to populate your dashboard.
				</p>
			</div>
		);
	}

	const currentTitle = formatExpenseHistoryMonth(view.current.month);
	const contextMonths = [
		...view.baselineMonths,
		...(view.baselineMonths.some(({ month }) => month === view.current.month)
			? []
			: [view.current]),
	];
	const contextDashboard: ExpenseDashboard = {
		...dashboard,
		months: contextMonths,
		importedMonthCount: contextMonths.length,
		typicalMonthlyTotal: view.baselineTotal,
	};
	const movers = view.categoryComparisons.filter(
		({ difference }) => Math.abs(difference) >= 0.01,
	);
	const recurringRows = view.recurringComparisons.slice(0, 6);

	return (
		<div className="space-y-12 px-6 py-6 md:px-10">
			<div className="flex flex-wrap items-end justify-between gap-5">
				<div>
					<p className="text-sm text-muted-foreground">Managing expenses for</p>
					<h2 className="sr-only">{view.current.month}</h2>
					<div className="mt-1 flex items-center">
						<Button
							disabled={!view.previousMonth}
							onClick={() => setMonth(view.previousMonth)}
							aria-label="Review previous imported month"
							size="icon"
							variant="outline"
							className="size-12 grow border-r-0"
						>
							<ChevronLeft className="size-5" />
						</Button>
						<Combobox
							options={dashboard.months.map(({ month }) => ({
								value: month,
								label: formatExpenseHistoryMonth(month),
							}))}
							value={view.current.month}
							onChange={(value) => setMonth(value)}
							className="text-xl h-12 font-semibold"
						/>
						<Button
							disabled={!view.nextMonth}
							onClick={() => setMonth(view.nextMonth)}
							aria-label="Review next imported month"
							size="icon"
							variant="outline"
							className="size-12 grow border-l-0"
						>
							<ChevronRight className="size-5" />
						</Button>
					</div>
				</div>
				<div className="flex flex-wrap items-end gap-4">
					<label className="grid gap-1" htmlFor="compare-with">
						<span className="text-sm text-muted-foreground">Compare with</span>
						<Combobox
							id="compare-with"
							options={comparisonOptions.map((option) => ({
								value: option.value,
								label: option.label,
							}))}
							value={comparison}
							onChange={(value) =>
								navigate({
									search: (previous) => ({
										...previous,
										compare:
											value === "3m"
												? undefined
												: (value as ExpenseDashboardComparison),
									}),
									replace: true,
								})
							}
						/>
					</label>
				</div>
			</div>

			<DashboardKeyMetrics view={view} dashboard={dashboard} />

			<DashboardCategoryDistribution
				view={view}
				dashboard={dashboard}
				currentTitle={currentTitle}
				onSelectCurrent={openHistory}
				onSelectBaseline={openBaselineHistory}
			/>

			<div className="grid gap-x-10 gap-y-12 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,1fr)]">
				<DashboardSection
					title="What changed"
					description={`Categories driving the difference from ${view.baselineLabel}`}
				>
					{view.baselineTotal === null ? (
						<p className="text-sm text-muted-foreground">
							There is no matching comparison data for {currentTitle}.
						</p>
					) : movers.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Spending was in line with the comparison.
						</p>
					) : (
						<ul className="divide-y divide-border">
							{movers.slice(0, 6).map((item) => {
								const increase = item.difference > 0;
								return (
									<li key={getExpenseCategoryLabel(item.category)}>
										<button
											type="button"
											onClick={() => openHistory(item.category)}
											className="focusable flex w-full items-center justify-between gap-5 py-3 text-left first:pt-0 hover:text-muted-foreground"
										>
											<span className="flex min-w-0 items-center gap-3">
												<span
													className="size-2.5 shrink-0 rounded-full"
													style={{
														backgroundColor: getExpenseCategoryColor(
															item.category,
														),
													}}
												/>
												<span className="truncate text-sm font-medium">
													{getExpenseCategoryLabel(item.category)}
												</span>
											</span>
											<span className="text-right">
												<span
													className={`block text-sm font-medium tabular-nums ${increase ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
												>
													{signedCurrency(item.difference, dashboard.currency)}
												</span>
												<span className="block text-xs text-muted-foreground">
													{formatCurrency(
														item.currentTotal,
														dashboard.currency,
													)}{" "}
													in {currentTitle}
												</span>
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</DashboardSection>

				<DashboardSection
					title="Recurring plan status"
					description="What has arrived compared with the monthly plan"
				>
					{recurringRows.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No recurring expenses configured.
						</p>
					) : (
						<ul className="divide-y divide-border">
							{recurringRows.map((expense) => {
								const remaining = Math.max(
									0,
									expense.expectedThisMonth - expense.currentActual,
								);
								const over = expense.currentActual - expense.expectedThisMonth;
								const canBeDuplicate = ![
									"Daily",
									"Hourly",
									"Weekly",
									"Bi-Weekly",
								].includes(expense.rate);
								const status =
									expense.expectation === "not-due"
										? `${expense.rate} · not due in ${currentTitle}`
										: expense.expectation === "unknown"
											? `${expense.rate} · billing month unknown`
											: canBeDuplicate && expense.currentTransactionCount > 1
												? `${expense.currentTransactionCount} charges detected`
												: expense.currentActual === 0
													? `${expense.rate} · expected in ${currentTitle}`
													: over > 0.01
														? `${formatCurrency(over, dashboard.currency)} over plan`
														: remaining > 0.01
															? `${formatCurrency(remaining, dashboard.currency)} still expected`
															: "On plan";
								return (
									<li
										key={expense.expenseId}
										className="flex items-center justify-between gap-4 py-3 first:pt-0"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">
												{expense.name}
											</p>
											<p className="mt-0.5 text-xs text-muted-foreground">
												{status}
											</p>
										</div>
										<p className="shrink-0 text-sm tabular-nums">
											{formatCurrency(
												expense.currentActual,
												dashboard.currency,
											)}
											{expense.expectation === "due" ||
											expense.expectation === "one-time" ? (
												<span className="text-muted-foreground">
													{" "}
													/{" "}
													{formatCurrency(
														expense.expectedThisMonth,
														dashboard.currency,
													)}
												</span>
											) : null}
										</p>
									</li>
								);
							})}
						</ul>
					)}
				</DashboardSection>
			</div>

			<DashboardSection
				title="Recent context"
				description={`The reviewed month against ${view.baselineLabel}`}
			>
				<MonthlySpendingTrend
					data={contextDashboard}
					referenceLabel="Comparison average"
					onSelect={({ month, category }) =>
						navigate({
							to: "/expenses/history",
							search: {
								month,
								category: category ? [category] : undefined,
								uncategorizedOnly: category === null ? true : undefined,
							},
						})
					}
				/>
			</DashboardSection>
		</div>
	);
}
