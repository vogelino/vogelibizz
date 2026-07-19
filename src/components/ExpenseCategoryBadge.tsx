import { IconBadge } from "@/components/ui/icon-badge";
import type { ExpenseType } from "@/db/schema";
import { cn } from "@/utility/classNames";
import {
	categoryToColorClass,
	mapCategoryToIcon,
} from "@/utility/expensesIconUtil";

export function ExpenseCategoryLabel({
	value,
}: {
	value: ExpenseType["category"];
}) {
	return (
		<span className="flex gap-2 items-center">
			{mapCategoryToIcon(value)}
			{value}
		</span>
	);
}

function ExpenseCategoryBadge<ValueType extends ExpenseType["category"]>({
	value,
}: {
	value: ValueType;
}) {
	return (
		<div className="bg-background w-fit">
			<IconBadge
				icon={null}
				label={<ExpenseCategoryLabel value={value} />}
				className={cn(categoryToColorClass(value), "m-0 h-7")}
			/>
		</div>
	);
}

export default ExpenseCategoryBadge;
