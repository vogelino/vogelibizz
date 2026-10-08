import type { ExpenseDashboardPageState } from "../../useExpenseDashboardPage";
import { DashboardCategoryDistribution } from "../category-distribution";
import { DashboardDailySpending } from "../daily-spending-heatmap";
import { DashboardControls } from "../dashboard-controls";
import { DashboardKeyMetrics } from "../key-metrics";
import { DashboardMovers } from "../movers";
import { DashboardRecentContext } from "../recent-context";
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
      <DashboardStateMessage title="The dashboard could not be loaded" message={state.message} />
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
        <DashboardControls
          dashboard={dashboard}
          view={view}
          comparison={comparison}
          onMonthChange={actions.setMonth}
          onComparisonChange={actions.setComparison}
        />
        <DashboardKeyMetrics view={view} dashboard={dashboard} />
        <DashboardCategoryDistribution
          view={view}
          dashboard={dashboard}
          onSelectCurrent={actions.openCurrentHistory}
          onSelectBaseline={actions.openBaselineHistory}
        />
        <DashboardMovers view={view} dashboard={dashboard} onSelect={actions.openCurrentHistory} />
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
