import { CalendarCheck, CalendarX2, WalletCards } from "lucide-react";
import { useMemo } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import { getSpendingHabits } from "../../spendingHabits";
import { DashboardSection } from "../dashboard-section";
import { DashboardMetric } from "../key-metrics/DashboardMetric";
import { DailySpendingHeatmap } from "./DailySpendingHeatmap";

type DashboardDailySpendingProps = {
	dashboard: ExpenseDashboard;
};

export function DashboardDailySpending({
	dashboard,
}: DashboardDailySpendingProps) {
	const habits = useMemo(() => getSpendingHabits(dashboard), [dashboard]);
	if (!habits) return null;
	const rangeStart = formatExpenseHistoryMonth(habits.range[0].slice(0, 7));
	const rangeEnd = formatExpenseHistoryMonth(habits.range[1].slice(0, 7));

	return (
		<DashboardSection
			title="Spending habits"
			description={`${rangeStart}–${rangeEnd} · colours are ranked against your own spending days`}
		>
			<div className="space-y-8">
				<DailySpendingHeatmap habits={habits} currency={dashboard.currency} />
				<div className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
					<DashboardMetric
						label="Typical spending day"
						value={formatCurrency(
							habits.typicalSpendingDay,
							dashboard.currency,
						)}
						detail={`${habits.spendingDayCount} days with spending`}
						icon={WalletCards}
					/>
					<DashboardMetric
						label="Highest-spend weekday"
						value={habits.highestSpendWeekday}
						detail={`${formatCurrency(
							habits.highestSpendWeekdayAverage,
							dashboard.currency,
						)} average per day`}
						icon={CalendarCheck}
					/>
					<DashboardMetric
						label="No-spend days"
						value={`${Math.round(habits.noSpendPercentage)}%`}
						detail={`${habits.noSpendDayCount} of ${habits.coveredDayCount} imported days`}
						icon={CalendarX2}
					/>
				</div>
			</div>
		</DashboardSection>
	);
}
