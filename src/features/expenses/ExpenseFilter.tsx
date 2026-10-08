import type { Table as TanstackTable } from "@tanstack/react-table";
import { ArrowLeftToLine } from "lucide-react";
import { useEffect, useMemo } from "react";

import ExpenseCategoryBadge, { ExpenseCategoryLabel } from "@/components/ExpenseCategoryBadge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FilterBar } from "@/components/ui/filter-bar";
import { IconBadge } from "@/components/ui/icon-badge";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import { mapTypeToIcon } from "@/utility/expensesIconUtil";
import useComboboxOptions from "@/utility/useComboboxOptions";

import { type ExpenseOverviewCategory, mixedClassification } from "./expenseOverviewRows";

const OPTION_VALUES = [
  "All types" as const,
  ...expenseTypeEnum.enumValues,
  mixedClassification,
  "Unclassified" as const,
] as const;

export type ExpenseFilterValue = (typeof OPTION_VALUES)[number];

export type ExpenseFilterState = {
  category: ExpenseOverviewCategory[];
  type: ExpenseFilterValue;
};

function MixedCategoryLabel() {
  return <IconBadge icon={mapTypeToIcon("Mixed")} label="Mixed" />;
}

type ExpenseFilterProps<TData> =
  | {
      loading: true;
      table?: never;
      filters?: never;
      onFiltersChange?: never;
      showMixedClassification?: boolean;
      showUnclassified?: boolean;
      forceVisible?: boolean;
    }
  | {
      loading: false;
      table: TanstackTable<TData>;
      filters: ExpenseFilterState;
      onFiltersChange: (filters: ExpenseFilterState) => void;
      showMixedClassification?: boolean;
      showUnclassified?: boolean;
      forceVisible?: boolean;
    };

export function ExpenseFilter<TData>(props: ExpenseFilterProps<TData>) {
  const {
    loading,
    showMixedClassification = false,
    showUnclassified = false,
    forceVisible = false,
  } = props;
  const categoryFilter = loading ? [] : props.filters.category;
  const typeFilter = loading ? "All types" : props.filters.type;
  const table = loading ? undefined : props.table;
  const categoryOptions = useComboboxOptions({
    optionValues: [...expenseCategoryEnum.enumValues, mixedClassification],
    renderer: (cat) =>
      cat === mixedClassification ? <MixedCategoryLabel /> : <ExpenseCategoryLabel value={cat} />,
  });

  const typeOptions = useComboboxOptions<ExpenseFilterValue>({
    optionValues: OPTION_VALUES.filter(
      (value) =>
        (showMixedClassification || value !== "Mixed") &&
        (showUnclassified || value !== "Unclassified"),
    ),
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

  useEffect(() => {
    if (!table) return;
    table.getColumn("category")?.setFilterValue(categoryFilter.length ? categoryFilter : undefined);
    table.getColumn("type")?.setFilterValue(typeFilter === "All types" ? undefined : typeFilter);
  }, [categoryFilter, table, typeFilter]);

  const categoryInput = (
    <MultiValueInput<ExpenseOverviewCategory>
      options={categoryOptions}
      values={categoryFilter}
      placeholder="Filter by category"
      selectedValueFormater={(value) =>
        value === mixedClassification ? (
          <MixedCategoryLabel />
        ) : (
          <ExpenseCategoryBadge value={value as Exclude<ExpenseOverviewCategory, "Mixed">} />
        )
      }
      onChange={
        loading
          ? undefined
          : (cat) => {
              const nextValues = cat.map((c) => c.value as ExpenseOverviewCategory);
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
          : (value: ExpenseFilterValue) => {
              props.onFiltersChange({ ...props.filters, type: value });
              const column = props.table.getColumn("type");
              if (!column) return;
              const nextValue = `${value}`;
              column.setFilterValue(nextValue === "All types" ? undefined : nextValue);
            }
      }
      loading={loading}
      className="w-40"
    />
  );

  return (
    <FilterBar active={showFilteredTotal || forceVisible}>
      {categoryInput}
      {typeInput}
      {!loading && showFilteredTotal ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            props.onFiltersChange({
              category: [],
              type: "All types",
            });
            props.table.getColumn("category")?.setFilterValue(undefined);
            props.table.getColumn("type")?.setFilterValue(undefined);
          }}
          className="h-9"
        >
          <ArrowLeftToLine size={20} />
          Clear filters
        </Button>
      ) : null}
    </FilterBar>
  );
}
