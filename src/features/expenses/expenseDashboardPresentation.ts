import { expenseCategoryEnum } from "@/db/schema";

export const uncategorizedLabel = "Uncategorized";
export const otherCategoriesLabel = "Other categories";

const categoryPalette = [
	"#6d5dfc",
	"#2e90fa",
	"#12b76a",
	"#f79009",
	"#ee46bc",
	"#06aed4",
	"#f04438",
	"#7a5af8",
	"#16b364",
	"#eaaa08",
	"#6172f3",
	"#ef6820",
	"#0ba5ec",
	"#9e77ed",
	"#15b79e",
	"#f63d68",
	"#4e5ba6",
	"#dc6803",
	"#0086c9",
	"#7f56d9",
	"#039855",
	"#d92d20",
] as const;

export function getExpenseCategoryLabel(
	category: (typeof expenseCategoryEnum.enumValues)[number] | null,
) {
	return category ?? uncategorizedLabel;
}

export function getExpenseCategoryColor(
	category: (typeof expenseCategoryEnum.enumValues)[number] | null,
) {
	if (category === null) return "#98a2b3";
	const index = expenseCategoryEnum.enumValues.indexOf(category);
	return categoryPalette[index % categoryPalette.length];
}
