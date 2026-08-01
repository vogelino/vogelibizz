import { Flame, PiggyBank, Trophy } from "lucide-react";
import { useMemo } from "react";
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
			? "Ready when you are"
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
			<div className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
				<DashboardMetric
					label={`Saved in ${currentTitle}`}
					value={formatCurrency(wins.currentSavings, dashboard.currency)}
					detail={currentDetail}
					icon={goalReached || wins.isPersonalBest ? Trophy : PiggyBank}
					iconClassName="text-green-600"
				/>
				<DashboardMetric
					label="Saving streak"
					value={streakValue}
					detail={streakDetail}
					icon={Flame}
					iconClassName="text-green-600"
				/>
				<DashboardMetric
					label="Saved in the last year"
					value={formatCurrency(wins.lastYearTotal, dashboard.currency)}
					detail={`${wins.savingMonthCount} ${wins.savingMonthCount === 1 ? "month" : "months"} with savings`}
					icon={PiggyBank}
					iconClassName="text-green-600"
				/>
			</div>
		</DashboardSection>
	);
}
