"use client";

import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	CircleAlert,
	ReceiptText,
	Tags,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useExpenseDashboard from "@/utility/data/useExpenseDashboard";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "./ExpenseHistoryPresentation";
import {
	getExpenseCategoryColor,
	getExpenseCategoryLabel,
} from "./expenseDashboardPresentation";
import { MonthlySpendingTrend } from "./MonthlySpendingTrend";

function DashboardCard({
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
		<div className="flex flex-col gap-2 p-5 border-r border-border last-of-type:border-r-0">
			<p className="text-sm text-muted-foreground flex items-center gap-2">
				<Icon className="size-4 text-muted-foreground" aria-hidden="true" />
				{label}
			</p>
			<p className="mt-2 text-2xl leading-5 font-semibold tabular-nums">
				{value}
			</p>
			<p className="mt-2 text-sm text-muted-foreground">{detail}</p>
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

function CategoryDistribution({
	dashboard,
	onSelect,
}: {
	dashboard: ExpenseDashboard;
	onSelect: (
		category: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) => void;
}) {
	const categories = dashboard.latest?.categories ?? [];
	const total = categories.reduce((sum, category) => sum + category.total, 0);
	if (total === 0) {
		return (
			<p className="text-sm text-muted-foreground">No spending to show.</p>
		);
	}
	return (
		<TooltipProvider delayDuration={100}>
			<fieldset
				className="flex h-9 w-full overflow-hidden rounded gap-px"
				aria-label="Category distribution"
			>
				{categories.map((item) => {
					const label = getExpenseCategoryLabel(item.category);
					const percentage = (item.total / total) * 100;
					return (
						<Tooltip key={label}>
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
									aria-label={`${label}: ${formatCurrency(item.total, dashboard.currency)}, ${percentage.toFixed(1)}%. View transactions.`}
								/>
							</TooltipTrigger>
							<TooltipContent>
								<p className="font-medium">{label}</p>
								<p>
									{formatCurrency(item.total, dashboard.currency)} ·{" "}
									{percentage.toFixed(1)}% · {item.transactionCount}{" "}
									{item.transactionCount === 1 ? "transaction" : "transactions"}
								</p>
								<p className="mt-1 text-xs opacity-75">Click to view</p>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</fieldset>
			<ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
				{categories.map((item) => {
					const label = getExpenseCategoryLabel(item.category);
					return (
						<li key={label}>
							<button
								type="button"
								onClick={() => onSelect(item.category)}
								className="focusable flex w-full items-center justify-between gap-3 text-left text-sm hover:text-foreground"
							>
								<span className="flex min-w-0 items-center gap-2">
									<span
										className="size-2.5 shrink-0 rounded-full"
										style={{
											backgroundColor: getExpenseCategoryColor(item.category),
										}}
									/>
									<span className="truncate">{label}</span>
								</span>
								<span className="shrink-0 tabular-nums text-muted-foreground">
									{((item.total / total) * 100).toFixed(0)}%
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</TooltipProvider>
	);
}

export default function ExpenseDashboardPage() {
	const dashboardQuery = useExpenseDashboard();
	const navigate = useNavigate();
	const dashboard = dashboardQuery.data;

	const openHistory = (
		month: string | undefined,
		category?: ExpenseDashboard["months"][number]["categories"][number]["category"],
	) =>
		navigate({
			to: "/expenses/history",
			search: {
				month,
				category: category ? [category] : undefined,
				uncategorizedOnly: category === null ? true : undefined,
			},
		});

	const highlights = useMemo(() => {
		if (!dashboard?.latest) return [];
		const result: {
			icon: typeof TrendingUp;
			title: string;
			detail: string;
		}[] = [];
		const latest = dashboard.latest;
		const baseline = latest.previousTotal ?? dashboard.typicalMonthlyTotal;
		if (baseline !== null && baseline > 0) {
			const change = latest.total - baseline;
			const percentage = Math.abs((change / baseline) * 100);
			result.push({
				icon: change > 0 ? TrendingUp : TrendingDown,
				title: `${percentage.toFixed(0)}% ${change > 0 ? "more" : "less"} than ${latest.previousTotal !== null ? "last month" : "typical"}`,
				detail: `${change > 0 ? "+" : "−"}${formatCurrency(Math.abs(change), dashboard.currency)}`,
			});
		}
		const topCategory = latest.categories[0];
		if (topCategory) {
			result.push({
				icon: Tags,
				title: `${getExpenseCategoryLabel(topCategory.category)} was the largest category`,
				detail: `${formatCurrency(topCategory.total, dashboard.currency)} · ${((topCategory.total / latest.total) * 100).toFixed(0)}% of spending`,
			});
		}
		if (latest.uncategorizedCount > 0 || latest.unmatchedCount > 0) {
			result.push({
				icon: CircleAlert,
				title: `${latest.reviewCount} ${latest.reviewCount === 1 ? "item" : "items"} may need review`,
				detail: `${latest.uncategorizedCount} uncategorized · ${latest.unmatchedCount} unmatched`,
			});
		}
		return result.slice(0, 3);
	}, [dashboard]);

	if (dashboardQuery.isPending) {
		return (
			<div className="space-y-10 px-6 py-6 md:px-10">
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{["spent", "typical", "recurring", "review"].map((key) => (
						<Skeleton key={key} className="h-32" />
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
	if (!dashboard || !dashboard.latest) {
		return (
			<div className="px-6 py-12 text-center md:px-10">
				<h2 className="font-semibold">No spending history yet</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Import a bank export to populate your dashboard.
				</p>
			</div>
		);
	}

	const latest = dashboard.latest;
	const monthLabel = formatExpenseHistoryMonth(latest.month);
	const matchedShare = latest.total > 0 ? latest.matched / latest.total : 0;
	return (
		<div className="space-y-10 px-6 py-6 md:px-10">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">Latest imported month</p>
					<h2 className="text-xl font-semibold">{monthLabel}</h2>
				</div>
				<button
					type="button"
					onClick={() => openHistory(latest.month)}
					className="focusable inline-flex items-center gap-2 text-sm font-medium hover:text-muted-foreground"
				>
					View all transactions <ArrowRight className="size-4" />
				</button>
			</div>

			<div className="grid sm:grid-cols-2 xl:grid-cols-4 w-[calc(100%+theme(space.10))] -ml-5">
				<DashboardCard
					label="Spent"
					value={formatCurrency(latest.total, dashboard.currency)}
					detail={monthLabel}
					icon={ReceiptText}
				/>
				<DashboardCard
					label="Typical month"
					value={
						dashboard.typicalMonthlyTotal === null
							? "–"
							: formatCurrency(
									dashboard.typicalMonthlyTotal,
									dashboard.currency,
								)
					}
					detail={`Median across ${dashboard.importedMonthCount} imported months`}
					icon={TrendingUp}
				/>
				<DashboardCard
					label="Planned recurring"
					value={formatCurrency(
						dashboard.configuredMonthlyTotal,
						dashboard.currency,
					)}
					detail={`${(matchedShare * 100).toFixed(0)}% of ${monthLabel} was matched`}
					icon={Tags}
				/>
				<DashboardCard
					label="Needs review"
					value={String(latest.reviewCount)}
					detail={`${formatCurrency(latest.unmatched, dashboard.currency)} unmatched`}
					icon={CircleAlert}
				/>
			</div>

			<DashboardSection
				title="Category distribution"
				description={`${monthLabel} · hover for details, click to inspect transactions`}
			>
				<CategoryDistribution
					dashboard={dashboard}
					onSelect={(category) => openHistory(latest.month, category)}
				/>
			</DashboardSection>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
				<DashboardSection
					title="Spending over time"
					description="Last 12 imported months, stacked by your largest categories"
				>
					<MonthlySpendingTrend
						data={dashboard}
						onSelect={({ month, category }) => openHistory(month, category)}
					/>
				</DashboardSection>
				<DashboardSection
					title="What stands out"
					description="Highlights from this month"
				>
					<ul className="divide-y divide-border">
						{highlights.map(({ icon: Icon, title, detail }) => (
							<li key={title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
								<Icon
									className="mt-0.5 size-4 shrink-0 text-muted-foreground"
									aria-hidden="true"
								/>
								<div>
									<p className="text-sm font-medium">{title}</p>
									<p className="mt-1 text-sm text-muted-foreground">{detail}</p>
								</div>
							</li>
						))}
					</ul>
				</DashboardSection>
			</div>
		</div>
	);
}
