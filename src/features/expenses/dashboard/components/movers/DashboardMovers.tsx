import { useMemo } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { getExpenseCategoryLabel } from "../../expenseDashboardPresentation";
import { CategoryColorDot } from "../category-color-dot";
import {
	DashboardSection,
	DashboardSectionMessage,
} from "../dashboard-section";
import { formatSignedCurrency } from "../formatSignedCurrency";

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
				<ul className="divide-y divide-border">
					{movers.map((item) => {
						const increase = item.difference > 0;
						return (
							<li key={getExpenseCategoryLabel(item.category)}>
								<button
									type="button"
									onClick={() => onSelect(item.category)}
									className="focusable flex w-full items-center justify-between gap-5 py-3 text-left first:pt-0 hover:text-muted-foreground"
								>
									<span className="flex min-w-0 items-center gap-3">
										<CategoryColorDot category={item.category} />
										<span className="truncate text-sm font-medium">
											{getExpenseCategoryLabel(item.category)}
										</span>
									</span>
									<span className="text-right">
										<span
											className={`block text-sm font-medium tabular-nums ${increase ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
										>
											{formatSignedCurrency(
												item.difference,
												dashboard.currency,
											)}
										</span>
										<span className="block text-xs text-muted-foreground">
											{formatCurrency(item.currentTotal, dashboard.currency)} in{" "}
											{currentTitle}
										</span>
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</DashboardSection>
	);
}
