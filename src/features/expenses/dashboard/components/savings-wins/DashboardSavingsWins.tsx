import { Flame, PiggyBank, Trophy } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/utility/classNames";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { getSavingsWins } from "../../savingsWins";
import { DashboardSection } from "../dashboard-section";
import { DashboardMetric } from "../key-metrics/DashboardMetric";

type DashboardSavingsWinsProps = {
	dashboard: ExpenseDashboard;
	view: ExpenseDashboardComparisonView;
};

export function DashboardSavingsWins({
	dashboard,
	view,
}: DashboardSavingsWinsProps) {
	const currentTitle = formatExpenseHistoryMonth(view.current.month);
	const wins = useMemo(
		() => getSavingsWins(dashboard, view.current.month),
		[dashboard, view.current.month],
	);
	const goalReached =
		wins.monthlyGoal > 0 && wins.currentSavings >= wins.monthlyGoal;
	const currentDetail = goalReached
		? "Monthly goal reached — great work!"
		: wins.isPersonalBest
			? "A new personal best — amazing!"
			: wins.monthlyGoal > 0
				? `${Math.round((wins.currentSavings / wins.monthlyGoal) * 100)}% of your monthly goal`
				: wins.currentSavings > 0
					? "A good step towards your goals"
					: "Every bit you save counts";
	const streakValue =
		wins.streak === 0
			? "None yet"
			: `${wins.streak} ${wins.streak === 1 ? "month" : "months"}`;
	const streakDetail =
		wins.streak === 0
			? `${currentTitle} is a fresh start`
			: wins.streak === 1
				? "A great start"
				: "Keep it going!";

	return (
		<DashboardSection
			title="Savings wins"
			description="Small steps add up. Celebrate what you put away."
		>
			<div className="grid border border-border xl:grid-cols-[2fr_1fr_1fr_1fr]">
				<div
					className={cn(
						"p-5 sm:p-6 md:px-8 relative z-10 col-span-2",
						wins.currentSavings > 0 &&
							"ring-1 bg-green-500/10 ring-green-500/50",
					)}
				>
					<DashboardMetric
						label={`Saved in ${currentTitle}`}
						value={formatCurrency(wins.currentSavings, dashboard.currency)}
						detail={currentDetail}
						icon={goalReached || wins.isPersonalBest ? Trophy : PiggyBank}
						iconClassName="text-green-600"
						size="large"
					/>
				</div>
				<div className="border-t border-border p-5 md:px-8 sm:border-t-0 sm:border-l sm:p-6">
					<DashboardMetric
						label="Saving streak"
						value={streakValue}
						detail={streakDetail}
						icon={Flame}
						iconClassName="text-green-600"
						size="compact"
					/>
				</div>
				<div className="border-t border-border p-5 md:px-8 sm:border-t-0 sm:border-l sm:p-6">
					<DashboardMetric
						label="Saved in the last year"
						value={formatCurrency(wins.lastYearTotal, dashboard.currency)}
						detail={`${wins.savingMonthCount} ${wins.savingMonthCount === 1 ? "month" : "months"} with savings`}
						icon={PiggyBank}
						iconClassName="text-green-600"
						size="compact"
					/>
				</div>
			</div>
		</DashboardSection>
	);
}
