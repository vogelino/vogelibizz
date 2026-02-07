"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
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
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import useComboboxOptions from "@/utility/useComboboxOptions";
import { expensesTableColumns } from "./columns";

type TypeFilterType = ExpenseWithMonthlyCLPPriceType["type"] | "All types";

export default function ExpensesPage() {
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

	const { data, error } = useExpenses();

	// biome-ignore lint/correctness/useExhaustiveDependencies: columns are stable from constants
	const columns = useMemo(
		() =>
			[
				...expensesTableColumns,
				lastModifiedColumn,
				deleteColumn,
				// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
			] as ColumnDef<ExpenseWithMonthlyCLPPriceType, any>[],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const totalPerMonth = useMemo(() => getTotalPerMonth(data), [data]);

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
			<div className="flex flex-col p-4 bg-muted my-4">
				<span className="text-sm text-muted-foreground">Monthly total</span>
				<span className="text-lg">{totalPerMonth}</span>
			</div>
			<div className="w-full mb-6">
				{data && (
					<DataTable
						columns={columns}
						data={!error && data.length > 0 ? data : []}
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
											value={
												value as ExpenseWithMonthlyCLPPriceType["category"]
											}
										/>
									)}
									onChange={(cat) => {
										const nextValues = cat.map(
											(c) =>
												c.value as ExpenseWithMonthlyCLPPriceType["category"],
										);
										setCategoryFilter(nextValues);
										table.getColumn("category")?.setFilterValue(nextValues);
									}}
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
								/>
							</div>
						)}
					/>
				)}
			</div>
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
