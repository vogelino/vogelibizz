import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { CategoryDistributionProps } from "./categoryDistributionTypes";
import { getCategoryTotal } from "./categoryDistributionUtils";
import { DistributionBars } from "./DistributionBars";
import { DistributionLegend } from "./DistributionLegend";

type DashboardDistributionProps = CategoryDistributionProps;

export function DashboardDistribution({
	view,
	dashboard,
	onSelectCurrent,
	onSelectBaseline,
}: DashboardDistributionProps) {
	const total = useMemo(
		() => getCategoryTotal(view.current.categories),
		[view.current.categories],
	);

	return (
		<TooltipProvider delayDuration={100}>
			<DistributionBars
				view={view}
				dashboard={dashboard}
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
