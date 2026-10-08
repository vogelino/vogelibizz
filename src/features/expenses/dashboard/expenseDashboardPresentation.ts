import type { expenseCategoryEnum } from "@/db/schema";
import { categoryToSolidColor } from "@/utility/expensesIconUtil";

export const uncategorizedLabel = "Uncategorized";
export const otherCategoriesLabel = "Other categories";

export function getExpenseCategoryLabel(
  category: (typeof expenseCategoryEnum.enumValues)[number] | null,
) {
  return category ?? uncategorizedLabel;
}

export function getExpenseCategoryColor(
  category: (typeof expenseCategoryEnum.enumValues)[number] | null,
) {
  return category === null ? "#6a7282" : categoryToSolidColor(category);
}
