import { IconBadge } from "@/components/ui/icon-badge";
import type { ExpenseType } from "@/db/schema";
import { cn } from "@/utility/classNames";
import {
	categoryToColorClass,
	categoryToOptionClass,
} from "@/utility/expensesIconUtil";

function ExpenseCategoryBadge<ValueType extends ExpenseType["category"]>({
	value,
}: {
	value: ValueType;
}) {
	return (
		<div className="rounded-full bg-background w-fit">
			<IconBadge
				icon={null}
				label={
					<span className="flex gap-2 items-center">
						<span
							className={cn(
								"size-2 rounded-full inline-block -mt-0.5",
								categoryToOptionClass(value),
							)}
						/>
						{value}
					</span>
				}
				className={cn(categoryToColorClass(value), "m-0")}
			/>
		</div>
	);
}

export default ExpenseCategoryBadge;
