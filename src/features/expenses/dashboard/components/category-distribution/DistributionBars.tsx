import { useMemo } from "react";
import { cn } from "@/utility/classNames";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { DistributionBar } from "./DistributionBar";

type Category =
	ExpenseDashboard["months"][number]["categories"][number]["category"];

type DistributionBarsProps = {
	currentTitle: string;
	view: ExpenseDashboardComparisonView;
	dashboard: ExpenseDashboard;
	onSelectCurrent: (category: Category) => void;
	onSelectBaseline: (category: Category) => void;
};

const distributionBarWrapperClass = cn(
	"grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3",
);
const distributionBarLabelClass = cn("truncate text-xs");

export function DistributionBars({
	currentTitle,
	view,
	dashboard,
	onSelectCurrent,
	onSelectBaseline,
}: DistributionBarsProps) {
	const baselineCategories = useMemo(
		() =>
			view.categoryComparisons
				.filter(({ baselineTotal }) => baselineTotal > 0)
				.map(({ category, baselineTotal }) => ({
					category,
					total: baselineTotal,
					transactionCount: 0,
				}))
				.sort((a, b) => b.total - a.total),
		[view.categoryComparisons],
	);
	return (
		<div className="space-y-3">
			<div className={distributionBarWrapperClass}>
				<p className={cn(distributionBarLabelClass, "font-semibold")}>
					{currentTitle}
				</p>
				<DistributionBar
					categories={view.current.categories}
					currency={dashboard.currency}
					label={`${currentTitle} category distribution`}
					onSelect={onSelectCurrent}
				/>
			</div>
			<div className={distributionBarWrapperClass}>
				<p className={cn(distributionBarLabelClass, "text-muted-foreground")}>
					Comparison
				</p>
				<DistributionBar
					categories={baselineCategories}
					currency={dashboard.currency}
					label={`${view.baselineLabel} category distribution`}
					onSelect={onSelectBaseline}
				/>
			</div>
		</div>
	);
}
