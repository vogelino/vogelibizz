"use client";

import { DataTable } from "@/components/DataTable";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { PillText } from "@/components/PillText";
import { Combobox } from "@/components/ui/combobox";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseCategoryEnum,
	expenseTypeEnum,
} from "@/db/schema";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useExpenses from "@/utility/data/useExpenses";
import {
	categoryToOptionClass,
	mapTypeToIcon,
} from "@/utility/expensesIconUtil";
import { formatCurrency } from "@/utility/formatUtil";
import { getDeleteColumn } from "@/utility/getDeleteColumn";
import useComboboxOptions from "@/utility/useComboboxOptions";
import {
	type ColumnFilter,
	type ColumnFiltersState,
	type SortingState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { expensesTableColumns } from "./columns";

type TypeFilterType = ExpenseWithMonthlyCLPPriceType["type"] | "All types";

export default function ExpensesPage() {
	const deleteMutation = useExpenseDelete();
	const deleteColumn = getDeleteColumn<ExpenseWithMonthlyCLPPriceType>((id) =>
		deleteMutation.mutate(id),
	);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setFilters] = useState<ColumnFiltersState>([]);
	const { data, error } = useExpenses();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo(
		() => [...expensesTableColumns, deleteColumn],
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
			pagination: { pageIndex: 0, pageSize: 1000 },
			sorting: [
				{
					id: "last_modified",
					desc: false,
				},
			],
		},
	});

	const totalPerMonth = useMemo(() => getTotalPerMonth(data), [data]);

	const categoryOptions = useComboboxOptions<
		ExpenseWithMonthlyCLPPriceType["category"]
	>(expenseCategoryEnum.enumValues, (cat) => (
		<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
	));

	const typeOptions = useComboboxOptions<TypeFilterType>(
		["All types", ...expenseTypeEnum.enumValues],
		(type) => (
			<>
				{mapTypeToIcon(type, 24)}
				<span className="pt-1">{type}</span>
			</>
		),
	);

	const typeFilter = useMemo(() => {
		const typeFilterValue = columnFilters.find((f) => f.id === "type");
		return typeFilterValue as
			| (Omit<ColumnFilter, "value"> & {
					value: ExpenseWithMonthlyCLPPriceType["type"];
			  })
			| undefined;
	}, [columnFilters]);

	const setType = useCallback((type: TypeFilterType) => {
		setFilters((prev) => {
			const otherFilters = prev.filter((f) => f.id !== "type");
			if (type === "All types") return otherFilters;
			return [...otherFilters, { id: "type", value: type }];
		});
	}, []);

	const categoryFilter = useMemo(
		() => columnFilters.filter((f) => f.id === "category"),
		[columnFilters],
	);

	const setCategoryFilter = useCallback(
		(categories: ExpenseWithMonthlyCLPPriceType["category"][]) => {
			setFilters((prev) => {
				const otherFilters = prev.filter((f) => f.id !== "category");
				if (categories.length === 0) return otherFilters;
				return [...otherFilters, { id: "category", value: categories }];
			});
		},
		[],
	);

	const categoryValues = categoryFilter[0]
		?.value as ExpenseWithMonthlyCLPPriceType["category"][];
	return (
		<>
			<div className="flex gap-6 justify-between items-center py-4 border-y border-grayLight my-4">
				<div className="flex items-center gap-4">
					<strong>Total per month:</strong>
					<span className="font-mono">{totalPerMonth}</span>
				</div>
				<div className="flex items-center gap-4">
					<MultiValueInput<ExpenseWithMonthlyCLPPriceType["category"]>
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

function getTotalPerMonth(data: ExpenseWithMonthlyCLPPriceType[]) {
	const total = data?.reduce((a, b) => {
		const monthlyPrice = b.clpMonthlyPrice;
		return a + (monthlyPrice ?? 0);
	}, 0);
	return total ? formatCurrency(total) : "–";
}
