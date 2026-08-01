import {
	ArrowDown,
	ArrowUp,
	CalendarClock,
	Check,
	CircleAlert,
	ReceiptText,
	TrendingDown,
	TrendingUp,
	WalletCards,
} from "lucide-react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { formatSignedCurrency } from "../formatSignedCurrency";
import { DashboardMetric } from "./DashboardMetric";

type DashboardKeyMetricsProps = {
	dashboard: ExpenseDashboard;
	view: ExpenseDashboardComparisonView;
};

export function DashboardKeyMetrics({
	view,
	dashboard,
}: DashboardKeyMetricsProps) {
	const currentTitle = formatExpenseHistoryMonth(view.current.month);
	const comparisonDetail =
		view.difference === null
			? `No data for ${view.baselineLabel}`
			: `${formatSignedCurrency(view.difference, dashboard.currency)} vs ${view.baselineLabel}`;
	const uncategorizedTotal =
		view.current.categories.find(({ category }) => category === null)?.total ??
		0;
	const recurringPlanStatus =
		view.recurringPlanVariance > 0.01
			? {
					icon: ArrowUp,
					iconClassName: "text-red-500",
					label: "Above plan",
				}
			: view.recurringPlanVariance < -0.01
				? {
						icon: ArrowDown,
						iconClassName: "text-red-500",
						label: "Below plan",
					}
				: {
						icon: Check,
						iconClassName: "text-green-600",
						label: "On plan",
					};
	return (
		<div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-5">
			<DashboardMetric
				label={`Spent in ${currentTitle}`}
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
				label="Set aside for bills"
				value={formatCurrency(
					dashboard.configuredMonthlyTotal,
					dashboard.currency,
				)}
				detail="Amount to keep each month for upcoming bills"
				icon={CalendarClock}
			/>
			<DashboardMetric
				label="Bills vs monthly plan"
				value={formatCurrency(
					Math.abs(view.recurringPlanVariance),
					dashboard.currency,
				)}
				detail={`${recurringPlanStatus.label} · big bills split into monthly amounts`}
				icon={recurringPlanStatus.icon}
				iconClassName={recurringPlanStatus.iconClassName}
			/>
			<DashboardMetric
				label={`Expected total for ${currentTitle}`}
				value={formatCurrency(view.committedOutlook, dashboard.currency)}
				detail="Spent so far, plus bills still to come"
				icon={WalletCards}
			/>
			<DashboardMetric
				label="Missing a category"
				value={String(view.current.uncategorizedCount)}
				detail={
					view.current.uncategorizedCount === 0
						? "Everything has a category"
						: `${formatCurrency(uncategorizedTotal, dashboard.currency)} needs a category`
				}
				icon={view.current.uncategorizedCount === 0 ? Check : CircleAlert}
				iconClassName={
					view.current.uncategorizedCount === 0 ? "text-green-600" : undefined
				}
			/>
		</div>
	);
}
