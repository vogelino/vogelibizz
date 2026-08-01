import { useMemo } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import {
	DashboardSection,
	DashboardSectionMessage,
} from "../dashboard-section";
import { SpendingChangeChart } from "./SpendingChangeChart";

type DashboardCategory =
	ExpenseDashboard["months"][number]["categories"][number]["category"];

type DashboardMoversProps = {
	dashboard: ExpenseDashboard;
	view: ExpenseDashboardComparisonView;
	onSelect: (category: DashboardCategory) => void;
};

export function DashboardMovers({
	dashboard,
	view,
	onSelect,
}: DashboardMoversProps) {
	const currentTitle = formatExpenseHistoryMonth(view.current.month);
	const movers = useMemo(
		() =>
			view.categoryComparisons
				.filter(({ difference }) => Math.abs(difference) >= 0.01)
				.slice(0, 6),
		[view.categoryComparisons],
	);

	return (
		<DashboardSection
			title="What changed"
			description={`Categories driving the difference from ${view.baselineLabel}`}
		>
			{view.baselineTotal === null ? (
				<DashboardSectionMessage>
					There is no matching comparison data for {currentTitle}.
				</DashboardSectionMessage>
			) : movers.length === 0 ? (
				<DashboardSectionMessage>
					Spending was in line with the comparison.
				</DashboardSectionMessage>
			) : (
				<SpendingChangeChart
					movers={movers}
					currency={dashboard.currency}
					currentTitle={currentTitle}
					baselineLabel={view.baselineLabel}
					onSelect={onSelect}
				/>
			)}
		</DashboardSection>
	);
}
