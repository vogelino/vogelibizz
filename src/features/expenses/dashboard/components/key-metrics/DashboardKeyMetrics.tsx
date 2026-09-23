import {
	ArrowDown,
	ArrowUp,
	CalendarClock,
	Check,
	ReceiptText,
	TrendingDown,
	TrendingUp,
	WalletCards,
} from "lucide-react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { DashboardSection } from "../dashboard-section";
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
	const recurringPlanStatus =
		view.recurringPlanVariance > 0.01
			? {
					icon: ArrowUp,
					iconClassName: "text-red-500",
					label: "+",
				}
			: view.recurringPlanVariance < -0.01
				? {
						icon: ArrowDown,
						iconClassName: "text-green-600",
						label: "-",
					}
				: {
						icon: Check,
						iconClassName: "text-green-600",
						label: "",
					};
	const recurringPlanValue =
		Math.abs(view.recurringPlanVariance) <= 0.01
			? "On plan"
			: `${recurringPlanStatus.label}${formatCurrency(
					Math.abs(view.recurringPlanVariance),
					dashboard.currency,
				)}`;
	return (
		<DashboardSection
			title={`${currentTitle} overview`}
			description="What you have spent and what is still expected."
		>
			<div className="overflow-hidden border border-border bg-border">
				<div className="grid lg:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr] gap-px">
					<DashboardMetric
						className="p-5 sm:p-6 md:px-8 bg-card"
						label="Spent so far"
						value={formatCurrency(view.current.total, dashboard.currency)}
						detail={comparisonDetail}
						icon={
							(view.difference ?? 0) > 0
								? TrendingUp
								: (view.difference ?? 0) < 0
									? TrendingDown
									: ReceiptText
						}
						size="large"
					/>
					<DashboardMetric
						className="bg-card p-5 sm:p-6 md:px-8"
						label={`Expected for ${currentTitle}`}
						value={formatCurrency(view.committedOutlook, dashboard.currency)}
						detail="Spent so far, plus bills still to come"
						icon={WalletCards}
						size="compact"
					/>
					<DashboardMetric
						className="p-5 bg-card sm:p-6 md:px-8"
						label="Monthly amount for bills"
						value={formatCurrency(
							dashboard.configuredMonthlyTotal,
							dashboard.currency,
						)}
						detail="Monthly bill reserve"
						icon={CalendarClock}
						size="compact"
					/>
					<DashboardMetric
						className="bg-card p-5 sm:p-6 md:px-8"
						label="Bills compared with plan"
						value={recurringPlanValue}
						detail="Big bills split monthly"
						icon={recurringPlanStatus.icon}
						iconClassName={recurringPlanStatus.iconClassName}
						size="compact"
					/>
				</div>
			</div>
		</DashboardSection>
	);
}
