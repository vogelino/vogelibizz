import type { Table as TanstackTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { PillText } from "@/components/PillText";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import {
	categoryToOptionClass,
	mapTypeToIcon,
} from "@/utility/expensesIconUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";
import {
	type ExpenseOverviewCategory,
	type ExpenseOverviewType,
	mixedClassification,
} from "./expenseOverviewRows";

const OPTION_VALUES = [
	"All types" as const,
	...expenseTypeEnum.enumValues,
	mixedClassification,
] as const;

export type ExpenseFilterValue = (typeof OPTION_VALUES)[number];

type TypeFilterType = ExpenseOverviewType | "All types";

type ExpenseFilterProps<TData> = {
	table: TanstackTable<TData>;
	isLoading: boolean;
	showMixedClassification?: boolean;
};

export function ExpenseFilter<TData>({
	table,
	isLoading,
	showMixedClassification = false,
}: ExpenseFilterProps<TData>) {
	const [categoryFilter, setCategoryFilter] = useState<
		ExpenseOverviewCategory[]
	>([]);
	const [typeFilter, setTypeFilter] = useState<ExpenseFilterValue>("All types");
	const categoryOptions = useComboboxOptions({
		optionValues: [...expenseCategoryEnum.enumValues, mixedClassification],
		renderer: (cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
	});

	const typeOptions = useComboboxOptions<ExpenseFilterValue>({
		optionValues: showMixedClassification
			? OPTION_VALUES
			: OPTION_VALUES.filter((v) => v !== "Mixed"),
		renderer: (type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span>{type}</span>
			</>
		),
	});

	const showFilteredTotal = useMemo(() => {
		const hasCategoryFilter = categoryFilter.length > 0;
		const hasTypeFilter = typeFilter !== "All types";
		return hasCategoryFilter || hasTypeFilter;
	}, [categoryFilter, typeFilter]);

	return (
		<div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
			<MultiValueInput<ExpenseOverviewCategory>
				options={categoryOptions}
				values={categoryFilter}
				placeholder="Filter by category"
				selectedValueFormater={(value) =>
					value === mixedClassification ? (
						<PillText pillColorClass="bg-muted-foreground">Mixed</PillText>
					) : (
						<ExpenseCategoryBadge
							value={value as Exclude<ExpenseOverviewCategory, "Mixed">}
						/>
					)
				}
				onChange={(cat) => {
					const nextValues = cat.map((c) => c.value as ExpenseOverviewCategory);
					setCategoryFilter(nextValues);
					table
						.getColumn("category")
						?.setFilterValue(nextValues.length ? nextValues : undefined);
				}}
				loading={isLoading}
			/>
			<Combobox
				options={typeOptions}
				value={typeFilter}
				onChange={(value: TypeFilterType) => {
					setTypeFilter(value);
					const column = table.getColumn("type");
					if (!column) return;
					const nextValue = `${value}`;
					column.setFilterValue(
						nextValue === "All types" ? undefined : nextValue,
					);
				}}
				loading={isLoading}
			/>
			{showFilteredTotal ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={isLoading}
					onClick={() => {
						setCategoryFilter([]);
						setTypeFilter("All types");
						table.getColumn("category")?.setFilterValue(undefined);
						table.getColumn("type")?.setFilterValue(undefined);
					}}
				>
					Clear filters
				</Button>
			) : null}
		</div>
	);
}
