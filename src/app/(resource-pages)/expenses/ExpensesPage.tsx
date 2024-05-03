"use client";

import { DataTable } from "@/components/DataTable";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { PillText } from "@/components/PillText";
import { Combobox } from "@/components/ui/combobox";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { expenseCategory, expenseType } from "@/db/schema";
import useExpenses, { type ExpenseType } from "@/utility/data/useExpenses";
import {
	categoryToOptionClass,
	getValueInCLPPerMonth,
	mapTypeToIcon,
	type RatesTypes,
} from "@/utility/expensesUtil";
import { formatCurrency } from "@/utility/formatUtil";
import { useActionsColumn } from "@/utility/useActionsColumn";
import useComboboxOptions from "@/utility/useComboboxOptions";
import type { LogicalFilter } from "@refinedev/core";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnFiltersState,
	type SortingState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { getExpensesTableColumns } from "./columns";

const RESOURCE_NAME = "expenses";

type TypeFilterType = ExpenseType["type"] | "All types";

export default function ExpensesPage({
	rates,
}: {
	rates: RatesTypes;
}) {
	const actions = useActionsColumn<ExpenseType>(RESOURCE_NAME);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setFilters] = useState<ColumnFiltersState>([]);
	const { data, error } = useExpenses();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo(
		() => [...getExpensesTableColumns(rates), actions],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const table = useReactTable({
		columns,
		data: !error && data.length > 0 ? data : [],
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setFilters,
		state: { sorting, columnFilters },
		initialState: {
			pagination: { pageIndex: 0, pageSize: 50 },
			sorting: [
				{
					id: "last_modified",
					desc: true,
				},
			],
		},
	});

	const totalPerMonth = useMemo(() => getTotalPerMonth(data, rates), [data, rates]);

	const categoryOptions = useComboboxOptions<ExpenseType["category"]>(
		expenseCategory.enumValues,
		(cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
	);

	const typeOptions = useComboboxOptions<TypeFilterType>(
		["All types", ...expenseType.enumValues],
		(type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span className="pt-1">{type}</span>
			</>
		),
	);

	const typeFilter = useMemo(() => {
		const typeFilterValue = columnFilters.find(
			(f) => f.id === "type",
		);
		return typeFilterValue as
			| (Omit<LogicalFilter, "value"> & { value: ExpenseType["type"] })
			| undefined;
	}, [columnFilters]);

	const setType = useCallback(
		(type: TypeFilterType) => {
			setFilters((prev) => {
				const otherFilters = prev.filter(
					(f) => f.id !== "type",
				);
				if (type === "All types") return otherFilters;
				return [
					...otherFilters,
					{ id: "type", value: type },
				];
			});
		},
		[setFilters],
	);

	const categoryFilter = useMemo(() => columnFilters.filter((f) => f.id === "category"), [columnFilters]);

	const setCategoryFilter = useCallback(
		(categories: ExpenseType["category"][]) => {
			setFilters((prev) => {
				const otherFilters = prev.filter(
					(f) => f.id !== "category",
				);
				if (categories.length === 0) return otherFilters;
				return [
					...otherFilters,
					{ id: "category", value: categories },
				];
			});
		},
		[setFilters],
	);

	const categoryValues = categoryFilter[0]?.value as ExpenseType["category"][];
	return (
		<>
			<div className="flex gap-6 justify-between items-center py-4 border-y border-grayLight my-4">
				<div className="flex items-center gap-4">
					<strong>Total per month:</strong>
					<span className="font-mono">{totalPerMonth}</span>
				</div>
				<div className="flex items-center gap-4">
					<MultiValueInput<ExpenseType["category"]>
						options={categoryOptions}
						values={categoryValues}
						placeholder="Filter by category"
						selectedValueFormater={(value) => (
							<ExpenseCategoryBadge value={value} />
						)}
						onChange={(cat) => setCategoryFilter(cat.map((c) => c.value))}
					/>
					<Combobox<TypeFilterType>
						className={"h-auto py-1 border-grayMed"}
						options={typeOptions}
						value={typeFilter?.value}
						onChange={setType}
					/>
				</div>
			</div>
			<div className="w-full mb-6">{data && <DataTable table={table} />}</div>
		</>
	);
}

function getTotalPerMonth(data: ExpenseType[], rates: RatesTypes ) {
		const total = data?.reduce((a, b) => {
			const monthlyPrice = getValueInCLPPerMonth({
				value: b.price,
				currency: b.original_currency,
				rates,
				billingRate: b.rate,
			});
			return a + (monthlyPrice ?? 0);
		}, 0);
		return total ? formatCurrency(total) : "–";
}