import { useMemo } from "react";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { DashboardSection } from "../dashboard-section";
import { MonthlySpendingTrend } from "./MonthlySpendingTrend";
import type { DashboardRecentContextProps } from "./recentContextTypes";

export function DashboardRecentContext({
	dashboard,
	view,
	onSelect,
}: DashboardRecentContextProps) {
	const contextDashboard = useMemo<ExpenseDashboard>(() => {
		const contextMonths = [
			...view.baselineMonths,
			...(view.baselineMonths.some(({ month }) => month === view.current.month)
				? []
				: [view.current]),
		];
		return {
			...dashboard,
			months: contextMonths,
			importedMonthCount: contextMonths.length,
			typicalMonthlyTotal: view.baselineTotal,
		};
	}, [dashboard, view]);

	return (
		<DashboardSection
			title="Recent context"
			description={`The reviewed month against ${view.baselineLabel}`}
		>
			<MonthlySpendingTrend
				data={contextDashboard}
				referenceLabel="Comparison average"
				onSelect={onSelect}
			/>
		</DashboardSection>
	);
}
