import type { ExpenseDashboardPageState } from "../../useExpenseDashboardPage";
import { DashboardCategoryDistribution } from "../category-distribution";
import { DashboardDailySpending } from "../daily-spending-heatmap";
import { DashboardControls } from "../dashboard-controls";
import { DashboardKeyMetrics } from "../key-metrics";
import { DashboardMovers } from "../movers";
import { DashboardRecentContext } from "../recent-context";
import { DashboardRecurringStatus } from "../recurring-status";
import { DashboardSavingsWins } from "../savings-wins";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardStateMessage } from "./DashboardStateMessage";

type ExpenseDashboardViewProps = {
	state: ExpenseDashboardPageState;
};

export function ExpenseDashboardView({ state }: ExpenseDashboardViewProps) {
	if (state.status === "pending") {
		return <DashboardSkeleton />;
	}
	if (state.status === "error") {
		return (
			<DashboardStateMessage
				title="The dashboard could not be loaded"
				message={state.message}
			/>
		);
	}
	if (state.status === "empty") {
		return (
			<DashboardStateMessage
				title="No spending history yet"
				message="Import a bank export to populate your dashboard."
			/>
		);
	}

	const { dashboard, view, comparison, actions } = state;
	return (
		<div className="space-y-16 px-6 py-6 md:px-10">
			<section className="space-y-12">
				<div>
					<h2 className="font-semibold">Monthly review</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Review one month and understand what changed
					</p>
				</div>
				<DashboardControls
					dashboard={dashboard}
					view={view}
					comparison={comparison}
					onMonthChange={actions.setMonth}
					onComparisonChange={actions.setComparison}
				/>
				<DashboardSavingsWins dashboard={dashboard} view={view} />
				<DashboardKeyMetrics view={view} dashboard={dashboard} />
				<DashboardCategoryDistribution
					view={view}
					dashboard={dashboard}
					onSelectCurrent={actions.openCurrentHistory}
					onSelectBaseline={actions.openBaselineHistory}
				/>
				<div className="grid gap-x-10 gap-y-12 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,1fr)]">
					<DashboardMovers
						view={view}
						dashboard={dashboard}
						onSelect={actions.openCurrentHistory}
					/>
					<DashboardRecurringStatus view={view} dashboard={dashboard} />
				</div>
				<DashboardRecentContext
					view={view}
					dashboard={dashboard}
					onSelect={actions.openTrendHistory}
				/>
			</section>
			<hr className="border-border" />
			<DashboardDailySpending dashboard={dashboard} />
		</div>
	);
}
