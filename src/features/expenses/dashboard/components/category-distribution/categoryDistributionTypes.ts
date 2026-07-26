import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import type { ExpenseDashboardComparisonView } from "../../expenseDashboardComparison";

type DashboardCategory =
	ExpenseDashboard["months"][number]["categories"][number]["category"];

export type CategoryDistributionProps = {
	dashboard: ExpenseDashboard;
	view: ExpenseDashboardComparisonView;
	onSelectCurrent: (category: DashboardCategory) => void;
	onSelectBaseline: (category: DashboardCategory) => void;
};
