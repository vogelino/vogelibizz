import type { ComponentProps } from "react";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";
import { DashboardSection } from "../DashboardSection";
import { DashboardDistribution } from "./DashboardDistribution";

type DashboardDistributionProps = ComponentProps<
	typeof DashboardDistribution
> & {
	currentTitle: string;
	view: ExpenseDashboardComparisonView;
};

export function DashboardCategoryDistribution({
	currentTitle,
	view,
	dashboard,
	onSelectCurrent,
	onSelectBaseline,
}: DashboardDistributionProps) {
	return (
		<DashboardSection
			title="Where the money went"
			description={`${currentTitle} compared with ${view.baselineLabel}. Hover for details; click to inspect transactions.`}
		>
			<DashboardDistribution
				view={view}
				dashboard={dashboard}
				currentTitle={currentTitle}
				onSelectCurrent={onSelectCurrent}
				onSelectBaseline={onSelectBaseline}
			/>
		</DashboardSection>
	);
}
