"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { PillText } from "@/components/PillText";
import { Combobox } from "@/components/ui/combobox";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseCategoryEnum,
	expenseTypeEnum,
} from "@/db/schema";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useExpenses from "@/utility/data/useExpenses";
import useSettings from "@/utility/data/useSettings";
import {
	categoryToOptionClass,
	mapTypeToIcon,
} from "@/utility/expensesIconUtil";
import { formatCurrency } from "@/utility/formatUtil";
import { getDeleteColumn } from "@/utility/getDeleteColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import useComboboxOptions from "@/utility/useComboboxOptions";
import { getExpensesTableColumns } from "./columns";

type TypeFilterType = ExpenseWithMonthlyCLPPriceType["type"] | "All types";

export default function ExpensesPage({
	loading = false,
}: {
	loading?: boolean;
}) {
	const deleteMutation = useExpenseDelete();
	const deleteColumn = getDeleteColumn<ExpenseWithMonthlyCLPPriceType>((id) =>
		deleteMutation.mutate(id),
	);
	const lastModifiedColumn =
		useLastModifiedColumn<ExpenseWithMonthlyCLPPriceType>();
	const [categoryFilter, setCategoryFilter] = useState<
		ExpenseWithMonthlyCLPPriceType["category"][]
	>([]);
	const [typeFilter, setTypeFilter] = useState<string | number | undefined>(
		"All types",
	);

	const { data = [], error, isPending } = useExpenses();
	const settingsQuery = useSettings();
	const targetCurrency = settingsQuery.data?.targetCurrency ?? "CLP";
	const isLoading = loading || isPending;

	// biome-ignore lint/correctness/useExhaustiveDependencies: columns are stable from constants
	const columns = useMemo(
		() =>
			[
				...getExpensesTableColumns(targetCurrency),
				lastModifiedColumn,
				deleteColumn,
				// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
			] as ColumnDef<ExpenseWithMonthlyCLPPriceType, any>[],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[targetCurrency],
	);

	const { totalLabel, filteredLabel, showFilteredTotal } = useMemo(() => {
		const hasCategoryFilter = categoryFilter.length > 0;
		const hasTypeFilter = typeFilter !== "All types";
		const filteredData =
			hasCategoryFilter || hasTypeFilter
				? data.filter((expense) => {
						if (
							hasCategoryFilter &&
							!categoryFilter.includes(expense.category)
						) {
							return false;
						}
						if (hasTypeFilter && expense.type !== typeFilter) {
							return false;
						}
						return true;
					})
				: data;

		const total = getTotalPerMonthValue(data);
		const filtered = getTotalPerMonthValue(filteredData);

		return {
			totalLabel: total ? formatCurrency(total, targetCurrency) : "–",
			filteredLabel: filtered ? formatCurrency(filtered, targetCurrency) : "–",
			showFilteredTotal: hasCategoryFilter || hasTypeFilter,
		};
	}, [categoryFilter, data, targetCurrency, typeFilter]);

	const categoryOptions = useComboboxOptions({
		optionValues: expenseCategoryEnum.enumValues,
		renderer: (cat) => (
			<PillText pillColorClass={categoryToOptionClass(cat)}>{cat}</PillText>
		),
	});

	const typeOptions = useComboboxOptions({
		optionValues: ["All types", ...expenseTypeEnum.enumValues],
		renderer: (type) => (
			<>
				{mapTypeToIcon(type as TypeFilterType, 24)}
				<span>{type}</span>
			</>
		),
	});
	return (
		<>
			<div className="p-4 bg-muted my-4">
				{showFilteredTotal ? (
					<div className="flex flex-wrap gap-6">
						<div className="flex flex-col">
							<span className="text-sm text-muted-foreground">
								Filtered total
							</span>
							<span className="text-lg">
								{isLoading ? (
									<Skeleton className="h-6 w-24 bg-accent-foreground/20 mt-1.5 mb-1" />
								) : (
									filteredLabel
								)}
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-sm text-muted-foreground">
								Monthly total
							</span>
							<span className="text-lg">
								{isLoading ? (
									<Skeleton className="h-6 w-24 bg-accent-foreground/20 mt-1.5 mb-1" />
								) : (
									totalLabel
								)}
							</span>
						</div>
					</div>
				) : (
					<div className="flex flex-col">
						<span className="text-sm text-muted-foreground">
							Monthly total
						</span>
						<span className="text-lg">
							{isLoading ? (
								<Skeleton className="h-6 w-24 bg-accent-foreground/20 mt-1.5 mb-1" />
							) : (
								totalLabel
							)}
						</span>
					</div>
				)}
			</div>
			<div className="w-full mb-6">
				<DataTable
					columns={columns}
					data={!error && data.length > 0 ? data : []}
					loading={isLoading}
					toolbarSkeleton={
						<div className="flex items-center gap-4">
							<Skeleton className="h-9 w-64" />
							<Skeleton className="h-9 w-40" />
						</div>
					}
					initialState={{
						pagination: { pageIndex: 0, pageSize: 1000 },
						sorting: [{ id: "last_modified", desc: false }],
						columnFilters: [
							...(categoryFilter.length
								? [{ id: "category", value: categoryFilter }]
								: []),
							...(typeFilter && typeFilter !== "All types"
								? [{ id: "type", value: String(typeFilter) }]
								: []),
						],
					}}
					toolbar={(table) => (
						<div className="flex items-center gap-4">
							<MultiValueInput<ExpenseWithMonthlyCLPPriceType["category"]>
								options={categoryOptions}
								values={
									categoryFilter as ExpenseWithMonthlyCLPPriceType["category"][]
								}
								placeholder="Filter by category"
								selectedValueFormater={(value) => (
									<ExpenseCategoryBadge
										value={value as ExpenseWithMonthlyCLPPriceType["category"]}
									/>
								)}
								onChange={(cat) => {
									const nextValues = cat.map(
										(c) =>
											c.value as ExpenseWithMonthlyCLPPriceType["category"],
									);
									setCategoryFilter(nextValues);
									table
										.getColumn("category")
										?.setFilterValue(
											nextValues.length ? nextValues : undefined,
										);
								}}
								loading={isLoading}
							/>
							<Combobox
								options={typeOptions}
								value={typeFilter}
								onChange={(value) => {
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
						</div>
					)}
				/>
			</div>
		</>
	);
}

function getTotalPerMonthValue(data: ExpenseWithMonthlyCLPPriceType[]) {
	return data?.reduce((a, b) => {
		const monthlyPrice = b.clpMonthlyPrice;
		return a + (monthlyPrice ?? 0);
	}, 0);
}
