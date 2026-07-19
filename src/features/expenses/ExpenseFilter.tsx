import type { Table as TanstackTable } from "@tanstack/react-table";
import { ArrowLeftToLine } from "lucide-react";
import { useEffect, useMemo } from "react";
import ExpenseCategoryBadge, {
	ExpenseCategoryLabel,
} from "@/components/ExpenseCategoryBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { IconBadge } from "@/components/ui/icon-badge";
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

export type ExpenseFilterState = {
	category: ExpenseOverviewCategory[];
	type: ExpenseFilterValue;
	otherOnly: boolean;
};

function MixedCategoryLabel() {
	return <IconBadge icon={mapTypeToIcon("Mixed")} label="Mixed" />;
}

type TypeFilterType = ExpenseOverviewType | "All types";

type ExpenseFilterProps<TData> =
	| {
			loading: true;
			table?: never;
			filters?: never;
			onFiltersChange?: never;
			showMixedClassification?: boolean;
	  }
	| {
			loading: false;
			table: TanstackTable<TData>;
			filters: ExpenseFilterState;
			onFiltersChange: (filters: ExpenseFilterState) => void;
			showMixedClassification?: boolean;
	  };

export function ExpenseFilter<TData>(props: ExpenseFilterProps<TData>) {
	const { loading, showMixedClassification = false } = props;
	const categoryFilter = loading ? [] : props.filters.category;
	const typeFilter = loading ? "All types" : props.filters.type;
	const otherOnly = loading ? false : props.filters.otherOnly;
	const table = loading ? undefined : props.table;
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
		const hasOtherOnlyFilter = otherOnly;
		return hasCategoryFilter || hasTypeFilter || hasOtherOnlyFilter;
	}, [categoryFilter, typeFilter, otherOnly]);

	useEffect(() => {
		if (!table) return;
		table
			.getColumn("category")
			?.setFilterValue(categoryFilter.length ? categoryFilter : undefined);
		table
			.getColumn("type")
			?.setFilterValue(typeFilter === "All types" ? undefined : typeFilter);
		table.getColumn("association")?.setFilterValue(otherOnly || undefined);
	}, [categoryFilter, otherOnly, table, typeFilter]);

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
							props.onFiltersChange({
								...props.filters,
								category: nextValues,
							});
							props.table
								.getColumn("category")
								?.setFilterValue(nextValues.length ? nextValues : undefined);
						}
			}
			loading={loading}
			className="min-w-64 max-w-full"
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
							props.onFiltersChange({ ...props.filters, type: value });
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

	const otherOnlyInput = (
		<label
			htmlFor="expense-history-other-only"
			className="flex items-center gap-2 text-sm"
		>
			<Checkbox
				id="expense-history-other-only"
				checked={otherOnly}
				onCheckedChange={
					loading
						? undefined
						: (checked) => {
								const next = Boolean(checked);
								props.onFiltersChange({
									...props.filters,
									otherOnly: next,
								});
								props.table
									.getColumn("association")
									?.setFilterValue(next || undefined);
							}
				}
			/>
			Other only
		</label>
	);

	return (
		<div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
			{categoryInput}
			{typeInput}
			{otherOnlyInput}
			{!loading && showFilteredTotal ? (
				<Button
					type="button"
					variant="ghost"
					onClick={() => {
						props.onFiltersChange({
							category: [],
							type: "All types",
							otherOnly: false,
						});
						props.table.getColumn("category")?.setFilterValue(undefined);
						props.table.getColumn("type")?.setFilterValue(undefined);
						props.table.getColumn("association")?.setFilterValue(undefined);
					}}
					className="h-9"
				>
					<ArrowLeftToLine size={20} />
					Clear filters
				</Button>
			) : null}
		</div>
	);
}
