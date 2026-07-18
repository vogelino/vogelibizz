import type { Table as TanstackTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import ExpenseCategoryBadge, {
	ExpenseCategoryLabel,
} from "@/components/ExpenseCategoryBadge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import { mapTypeToIcon } from "@/utility/expensesIconUtil";
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

function MixedCategoryLabel() {
	return (
		<span className="flex gap-2 items-center">
			{mapTypeToIcon("Mixed")}
			{mixedClassification}
		</span>
	);
}

type TypeFilterType = ExpenseOverviewType | "All types";

type ExpenseFilterProps<TData> =
	| {
			loading: true;
			table?: never;
			showMixedClassification?: boolean;
	  }
	| {
			loading: false;
			table: TanstackTable<TData>;
			showMixedClassification?: boolean;
	  };

export function ExpenseFilter<TData>(props: ExpenseFilterProps<TData>) {
	const { loading, showMixedClassification = false } = props;
	const [categoryFilter, setCategoryFilter] = useState<
		ExpenseOverviewCategory[]
	>([]);
	const [typeFilter, setTypeFilter] = useState<ExpenseFilterValue>("All types");
	const categoryOptions = useComboboxOptions({
		optionValues: [...expenseCategoryEnum.enumValues, mixedClassification],
		renderer: (cat) =>
			cat === mixedClassification ? (
				<MixedCategoryLabel />
			) : (
				<ExpenseCategoryLabel value={cat} />
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
	const categoryInput = (
		<MultiValueInput<ExpenseOverviewCategory>
			options={categoryOptions}
			values={categoryFilter}
			placeholder="Filter by category"
			selectedValueFormater={(value) =>
				value === mixedClassification ? (
					<MixedCategoryLabel />
				) : (
					<ExpenseCategoryBadge
						value={value as Exclude<ExpenseOverviewCategory, "Mixed">}
					/>
				)
			}
			onChange={
				loading
					? undefined
					: (cat) => {
							const nextValues = cat.map(
								(c) => c.value as ExpenseOverviewCategory,
							);
							setCategoryFilter(nextValues);
							props.table
								.getColumn("category")
								?.setFilterValue(nextValues.length ? nextValues : undefined);
						}
			}
			loading={loading}
			className="w-64"
		/>
	);
	const typeInput = (
		<Combobox
			options={typeOptions}
			value={typeFilter}
			onChange={
				loading
					? undefined
					: (value: TypeFilterType) => {
							setTypeFilter(value);
							const column = props.table.getColumn("type");
							if (!column) return;
							const nextValue = `${value}`;
							column.setFilterValue(
								nextValue === "All types" ? undefined : nextValue,
							);
						}
			}
			loading={loading}
			className="w-40"
		/>
	);

	return (
		<div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
			{categoryInput}
			{typeInput}
			{!loading && showFilteredTotal ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						setCategoryFilter([]);
						setTypeFilter("All types");
						props.table.getColumn("category")?.setFilterValue(undefined);
						props.table.getColumn("type")?.setFilterValue(undefined);
					}}
				>
					Clear filters
				</Button>
			) : null}
		</div>
	);
}
