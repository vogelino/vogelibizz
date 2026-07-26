import {
	CalendarDays,
	CircleAlert,
	ReceiptText,
	TrendingDown,
	TrendingUp,
	WalletCards,
} from "lucide-react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import type { ExpenseDashboardComparisonView } from "../expenseDashboardComparison";
import { DashboardMetric } from "./DashboardMetric";

type DashboardKeyMetricsProps = {
	view: ExpenseDashboardComparisonView;
	dashboard: ExpenseDashboard;
};

function signedCurrency(value: number, currency: ExpenseDashboard["currency"]) {
	if (value === 0) return formatCurrency(0, currency);
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value), currency)}`;
}

export function DashboardKeyMetrics({
	view,
	dashboard,
}: DashboardKeyMetricsProps) {
	const comparisonDetail =
		view.difference === null
			? `No data for ${view.baselineLabel}`
			: `${signedCurrency(view.difference, dashboard.currency)} vs ${view.baselineLabel}`;
	return (
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
	);
}
