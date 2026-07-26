import { formatExpenseHistoryMonth } from "../../../ExpenseHistoryPresentation";
import { DashboardSection } from "../dashboard-section";
import type { CategoryDistributionProps } from "./categoryDistributionTypes";
import { DashboardDistribution } from "./DashboardDistribution";

type DashboardCategoryDistributionProps = CategoryDistributionProps;

export function DashboardCategoryDistribution({
	view,
	dashboard,
	onSelectCurrent,
	onSelectBaseline,
}: DashboardCategoryDistributionProps) {
	const currentTitle = formatExpenseHistoryMonth(view.current.month);
	return (
		<DashboardSection
			title="Where the money went"
			description={`${currentTitle} compared with ${view.baselineLabel}. Hover for details; click to inspect transactions.`}
		>
			<DashboardDistribution
				view={view}
				dashboard={dashboard}
				onSelectCurrent={onSelectCurrent}
				onSelectBaseline={onSelectBaseline}
			/>
		</DashboardSection>
	);
}
