import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";

import { getExpenseCategoryLabel } from "../../expenseDashboardPresentation";
import { CategoryColorDot } from "../category-color-dot";

type DashboardCategory = ExpenseDashboard["months"][number]["categories"][number]["category"];

type DistributionLegendProps = {
  currentCategories: ExpenseDashboard["months"][number]["categories"];
  total: number;
  onSelectCurrent: (category: DashboardCategory) => void;
};
export function DistributionLegend({
  currentCategories,
  total,
  onSelectCurrent,
}: DistributionLegendProps) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 pb-6 text-foreground">
      {currentCategories.map((item) => {
        const label = getExpenseCategoryLabel(item.category);
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => onSelectCurrent(item.category)}
              className="focusable flex items-center gap-2 text-left text-sm hover:text-foreground"
            >
              <CategoryColorDot category={item.category} />
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">
                {total === 0 ? "0%" : `${((item.total / total) * 100).toFixed(0)}%`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
