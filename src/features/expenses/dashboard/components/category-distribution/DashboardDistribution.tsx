import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { DistributionBars } from "./DistributionBars";
import { DistributionLegend } from "./DistributionLegend";

type Category =
	ExpenseDashboard["months"][number]["categories"][number]["category"];

type CategoryDistributionProps = {
	view: ExpenseDashboardComparisonView;
	dashboard: ExpenseDashboard;
	currentTitle: string;
	onSelectCurrent: (category: Category) => void;
	onSelectBaseline: (category: Category) => void;
};

export function DashboardDistribution({
	currentTitle,
	view,
	dashboard,
	onSelectCurrent,
	onSelectBaseline,
}: CategoryDistributionProps) {
	const total = useMemo(
		() =>
			view.current.categories.reduce(
				(sum, category) => sum + category.total,
				0,
			),
		[view.current.categories],
	);

	return (
		<TooltipProvider delayDuration={100}>
			<DistributionBars
				view={view}
				dashboard={dashboard}
				currentTitle={currentTitle}
				onSelectCurrent={onSelectCurrent}
				onSelectBaseline={onSelectBaseline}
			/>
			<DistributionLegend
				currentCategories={view.current.categories}
				total={total}
				onSelectCurrent={onSelectCurrent}
			/>
		</TooltipProvider>
	);
}
