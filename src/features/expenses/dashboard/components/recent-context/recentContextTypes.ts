import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";

type DashboardCategory = ExpenseDashboard["months"][number]["categories"][number]["category"];

export type TrendSelection = {
  month: string;
  category: DashboardCategory | undefined;
};

export type DashboardRecentContextProps = {
  dashboard: ExpenseDashboard;
  view: ExpenseDashboardComparisonView;
  onSelect: (selection: TrendSelection) => void;
};

export type MonthlySpendingTrendProps = {
  data: ExpenseDashboard;
  onSelect: (selection: TrendSelection) => void;
  referenceLabel?: string;
};
