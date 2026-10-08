import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";

import {
  getExpenseCategoryColor,
  getExpenseCategoryLabel,
} from "../../expenseDashboardPresentation";
import { getCategoryTotal } from "./categoryDistributionUtils";

type DashboardCategory = ExpenseDashboard["months"][number]["categories"][number]["category"];

type DistributionBarProps = {
  categories: ExpenseDashboard["months"][number]["categories"];
  currency: ExpenseDashboard["currency"];
  label: string;
  onSelect: (category: DashboardCategory) => void;
};

export function DistributionBar({ categories, currency, label, onSelect }: DistributionBarProps) {
  const total = getCategoryTotal(categories);
  if (total === 0) {
    return <div className="h-8 bg-muted" role="img" aria-label={`${label}: no data`} />;
  }
  return (
    <fieldset className="flex h-8 w-full gap-px overflow-hidden" aria-label={label}>
      {categories.map((item) => {
        const categoryLabel = getExpenseCategoryLabel(item.category);
        const percentage = (item.total / total) * 100;
        return (
          <Tooltip key={categoryLabel}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onSelect(item.category)}
                className="focusable h-full min-w-0 transition-[filter,transform] hover:z-10 hover:brightness-110 focus-visible:z-10"
                style={{
                  flexGrow: item.total,
                  flexBasis: 0,
                  backgroundColor: getExpenseCategoryColor(item.category),
                  minWidth: percentage > 0 ? 3 : 0,
                }}
                aria-label={`${categoryLabel}: ${formatCurrency(item.total, currency)}, ${percentage.toFixed(1)}%. View transactions.`}
              />
            </TooltipTrigger>
            <TooltipContent className="text-sm text-foreground">
              <p className="font-medium">{categoryLabel}</p>
              <p>
                {formatCurrency(item.total, currency)} · {percentage.toFixed(1)}%
              </p>
              <p className="mt-1 opacity-75">Click to view</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </fieldset>
  );
}
