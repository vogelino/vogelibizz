"use client";

import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	CircleAlert,
	ReceiptText,
	TrendingDown,
	TrendingUp,
	WalletCards,
} from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Route } from "@/routes/_resource/expenses/dashboard";
import useExpenseDashboard from "@/utility/data/useExpenseDashboard";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "./ExpenseHistoryPresentation";
import {
	type ExpenseDashboardComparison,
	getExpenseDashboardComparisonView,
} from "./expenseDashboardComparison";
import {
	getExpenseCategoryColor,
	getExpenseCategoryLabel,
} from "./expenseDashboardPresentation";
import { MonthlySpendingTrend } from "./MonthlySpendingTrend";

const comparisonOptions: readonly {
	value: ExpenseDashboardComparison;
	label: string;
}[] = [
	{ value: "previous", label: "Previous month" },
	{ value: "3m", label: "Previous 3-month average" },
	{ value: "6m", label: "Previous 6-month average" },
	{ value: "12m", label: "Previous 12-month average" },
	{ value: "year", label: "Same month last year" },
];

function DashboardMetric({
	label,
	value,
	detail,
	icon: Icon,
}: {
	label: string;
	value: string;
	detail: string;
	icon: typeof ReceiptText;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<p className="flex items-center gap-2 text-sm text-muted-foreground">
				<Icon className="size-4" aria-hidden="true" />
				{label}
			</p>
			<p className="mt-1 text-2xl font-semibold leading-6 tabular-nums">
				{value}
			</p>
			<p className="text-sm text-muted-foreground">{detail}</p>
		</div>
	);
}

function DashboardSection({
	title,
	description,
	children,
	className = "",
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<section className={className}>
			<div className="mb-5">
				<h2 className="font-semibold">{title}</h2>
				{description ? (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

function DistributionBar({
	categories,
	currency,
	label,
	onSelect,
}: {
	categories: ExpenseDashboard["months"][number]["categories"];
	currency: ExpenseDashboard["currency"];
	label: string;
	onSelect: (
		category: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) => void;
}) {
	const total = categories.reduce((sum, category) => sum + category.total, 0);
	if (total === 0) {
		return (
			<div
				className="h-8 rounded bg-muted"
				role="img"
				aria-label={`${label}: no data`}
			/>
		);
	}
	return (
		<fieldset
			className="flex h-8 w-full gap-px overflow-hidden rounded"
			aria-label={label}
		>
			{categories.map((item) => {
				const categoryLabel = getExpenseCategoryLabel(item.category);
				const percentage = (item.total / total) * 100;
				return (
					<Tooltip key={categoryLabel}>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={() => onSelect(item.category)}
								className="focusable h-full min-w-0 transition-[filter,transform] first:rounded-l-md last:rounded-r-md hover:z-10 hover:brightness-110 focus-visible:z-10"
								style={{
									flexGrow: item.total,
									flexBasis: 0,
									backgroundColor: getExpenseCategoryColor(item.category),
									minWidth: percentage > 0 ? 3 : 0,
								}}
								aria-label={`${categoryLabel}: ${formatCurrency(item.total, currency)}, ${percentage.toFixed(1)}%. View transactions.`}
							/>
						</TooltipTrigger>
						<TooltipContent className="bg-popover text-popover-foreground">
							<p className="font-medium">{categoryLabel}</p>
							<p>
								{formatCurrency(item.total, currency)} · {percentage.toFixed(1)}
								%
							</p>
							<p className="mt-1 text-xs opacity-75">Click to view</p>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</fieldset>
	);
}

function CategoryDistribution({
	currentCategories,
	baselineCategories,
	currentLabel,
	baselineLabel,
	currency,
	onSelectCurrent,
	onSelectBaseline,
}: {
	currentCategories: ExpenseDashboard["months"][number]["categories"];
	baselineCategories: ExpenseDashboard["months"][number]["categories"];
	currentLabel: string;
	baselineLabel: string;
	currency: ExpenseDashboard["currency"];
	onSelectCurrent: (
		category: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) => void;
	onSelectBaseline: (
		category: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) => void;
}) {
	const total = currentCategories.reduce(
		(sum, category) => sum + category.total,
		0,
	);
	return (
		<TooltipProvider delayDuration={100}>
			<div className="space-y-3">
				<div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
					<p className="truncate text-xs font-medium">{currentLabel}</p>
					<DistributionBar
						categories={currentCategories}
						currency={currency}
						label={`${currentLabel} category distribution`}
						onSelect={onSelectCurrent}
					/>
				</div>
				<div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
					<p className="truncate text-xs text-muted-foreground">Comparison</p>
					<DistributionBar
						categories={baselineCategories}
						currency={currency}
						label={`${baselineLabel} category distribution`}
						onSelect={onSelectBaseline}
					/>
				</div>
			</div>
			<ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
				{currentCategories.map((item) => {
					const label = getExpenseCategoryLabel(item.category);
					return (
						<li key={label}>
							<button
								type="button"
								onClick={() => onSelectCurrent(item.category)}
								className="focusable flex items-center gap-2 text-left text-sm hover:text-foreground"
							>
								<span
									className="size-2.5 shrink-0 rounded-full"
									style={{
										backgroundColor: getExpenseCategoryColor(item.category),
									}}
								/>
								<span>{label}</span>
								<span className="tabular-nums text-muted-foreground">
									{total === 0
										? "0%"
										: `${((item.total / total) * 100).toFixed(0)}%`}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</TooltipProvider>
	);
}

function signedCurrency(value: number, currency: ExpenseDashboard["currency"]) {
	if (value === 0) return formatCurrency(0, currency);
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value), currency)}`;
}

export default function ExpenseDashboardPage() {
	const dashboardQuery = useExpenseDashboard();
	const navigate = useNavigate({ from: Route.fullPath });
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
	const baselineCategories = view.categoryComparisons
		.filter(({ baselineTotal }) => baselineTotal > 0)
		.map(({ category, baselineTotal }) => ({
			category,
			total: baselineTotal,
			transactionCount: 0,
		}))
		.sort((a, b) => b.total - a.total);
	const comparisonDetail =
		view.difference === null
			? `No data for ${view.baselineLabel}`
			: `${signedCurrency(view.difference, dashboard.currency)} vs ${view.baselineLabel}`;
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
					<div className="mt-1 flex items-center gap-1">
						<button
							type="button"
							disabled={!view.previousMonth}
							onClick={() => setMonth(view.previousMonth)}
							className="focusable rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
							aria-label="Review previous imported month"
						>
							<ChevronLeft className="size-4" />
						</button>
						<select
							value={view.current.month}
							onChange={(event) => setMonth(event.target.value)}
							className="focusable rounded-md border border-input bg-background px-3 py-1.5 text-lg font-semibold"
							aria-label="Month to review"
						>
							{[...dashboard.months].reverse().map(({ month }) => (
								<option key={month} value={month}>
									{formatExpenseHistoryMonth(month)}
								</option>
							))}
						</select>
						<button
							type="button"
							disabled={!view.nextMonth}
							onClick={() => setMonth(view.nextMonth)}
							className="focusable rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
							aria-label="Review next imported month"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
				</div>
				<div className="flex flex-wrap items-end gap-4">
					<label className="grid gap-1.5 text-xs text-muted-foreground">
						Compare with
						<select
							value={comparison}
							onChange={(event) =>
								navigate({
									search: (previous) => ({
										...previous,
										compare:
											event.target.value === "3m"
												? undefined
												: (event.target.value as ExpenseDashboardComparison),
									}),
									replace: true,
								})
							}
							className="focusable rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground"
						>
							{comparisonOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<button
						type="button"
						onClick={() => openHistory()}
						className="focusable inline-flex items-center gap-2 py-2 text-sm font-medium hover:text-muted-foreground"
					>
						View transactions <ArrowRight className="size-4" />
					</button>
				</div>
			</div>

			<div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
				<DashboardMetric
					label="Spent this month"
					value={formatCurrency(view.current.total, dashboard.currency)}
					detail={comparisonDetail}
					icon={
						(view.difference ?? 0) > 0
							? TrendingUp
							: (view.difference ?? 0) < 0
								? TrendingDown
								: ReceiptText
					}
				/>
				<DashboardMetric
					label="Recurring still expected"
					value={formatCurrency(
						view.expectedRecurringRemaining,
						dashboard.currency,
					)}
					detail={`${formatCurrency(view.current.matched, dashboard.currency)} matched so far`}
					icon={CalendarDays}
				/>
				<DashboardMetric
					label="Committed outlook"
					value={formatCurrency(view.committedOutlook, dashboard.currency)}
					detail="Spent plus recurring amounts not seen yet"
					icon={WalletCards}
				/>
				<DashboardMetric
					label="Needs review"
					value={String(view.current.reviewCount)}
					detail={`${formatCurrency(view.current.unmatched, dashboard.currency)} unmatched`}
					icon={CircleAlert}
				/>
			</div>

			<DashboardSection
				title="Where the money went"
				description={`${currentTitle} compared with ${view.baselineLabel}. Hover for details; click to inspect transactions.`}
			>
				<CategoryDistribution
					currentCategories={view.current.categories}
					baselineCategories={baselineCategories}
					currentLabel={currentTitle}
					baselineLabel={view.baselineLabel}
					currency={dashboard.currency}
					onSelectCurrent={openHistory}
					onSelectBaseline={openBaselineHistory}
				/>
			</DashboardSection>

			<div className="grid gap-x-10 gap-y-12 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,1fr)]">
				<DashboardSection
					title="What changed"
					description={`Categories driving the difference from ${view.baselineLabel}`}
				>
					{view.baselineTotal === null ? (
						<p className="text-sm text-muted-foreground">
							There is no matching comparison data for this month.
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
													this month
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
									expense.planned - expense.currentActual,
								);
								const over = expense.currentActual - expense.planned;
								const status =
									expense.currentTransactionCount > 1
										? `${expense.currentTransactionCount} charges detected`
										: expense.currentActual === 0
											? "Not seen yet"
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
											<span className="text-muted-foreground">
												{" "}
												/ {formatCurrency(expense.planned, dashboard.currency)}
											</span>
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
