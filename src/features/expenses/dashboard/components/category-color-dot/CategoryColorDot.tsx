import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

import { getExpenseCategoryColor } from "../../expenseDashboardPresentation";

type DashboardCategory = ExpenseDashboard["months"][number]["categories"][number]["category"];

type CategoryColorDotProps = {
  category: DashboardCategory;
};

export function CategoryColorDot({ category }: CategoryColorDotProps) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: getExpenseCategoryColor(category) }}
    />
  );
}
