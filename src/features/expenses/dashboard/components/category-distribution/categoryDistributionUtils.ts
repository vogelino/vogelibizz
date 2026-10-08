import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

type DashboardCategories = ExpenseDashboard["months"][number]["categories"];

export function getCategoryTotal(categories: DashboardCategories) {
  return categories.reduce((total, category) => total + category.total, 0);
}
