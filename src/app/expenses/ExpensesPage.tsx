"use client";

import { DataTable } from "@components/DataTable";
import ExpenseCategoryBadge from "@components/ExpenseCategoryBadge";
import { PillText } from "@components/PillText";
import { Button } from "@components/ui/button";
import { Combobox } from "@components/ui/combobox";
import { MultiValueInput } from "@components/ui/multi-value-input";
import { type ExpenseType, expenseCategory, expenseType } from "@db/schema";
import { type LogicalFilter, useNavigation } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import {
	type RatesTypes,
	categoryToOptionClass,
	getValueInCLPPerMonth,
	mapTypeToIcon,
} from "@utility/expensesUtil";
import { formatCurrency } from "@utility/formatUtil";
import { useActionsColumn } from "@utility/useActionsColumn";
import useComboboxOptions from "@utility/useComboboxOptions";
import { useDefaultSort } from "@utility/useDefaultSort";
import { useCallback, useMemo } from "react";
import { getExpensesTableColumns } from "./columns";

const RESOURCE_NAME = "expenses";

type TypeFilterType = ExpenseType["type"] | "All types";

export default function ExpensesPage({
	rates,
	initialData,
}: {
	rates: RatesTypes;
	initialData: ExpenseType[];
}) {
	const { create } = useNavigation();
	const actions = useActionsColumn<ExpenseType>(RESOURCE_NAME);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo(
		() => [...getExpensesTableColumns(rates), actions],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const table = useTable({
		columns,
		refineCoreProps: {
			meta: {
				select: "*",
			},
			pagination: { pageSize: 1000 },
			syncWithLocation: true,
		},
	});
	const {
		setOptions,
		setSorting,
		refineCore: {
			tableQueryResult: { data: tableData },
			filters,
			setFilters,
		},
	} = table;

	setOptions((prev) => ({
		...prev,
		meta: {
			...prev.meta,
		},
	}));

	useDefaultSort({ setSorting, defaultColumnId: "last_modified" });

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const totalPerMonth = useMemo(() => {
		const total = tableData?.data.reduce((a, b) => {
			const monthlyPrice = getValueInCLPPerMonth({
				value: b.price,
				currency: b.original_currency,
				rates,
				billingRate: b.rate,
			});
			return a + (monthlyPrice ?? 0);
		}, 0);
		return total ? formatCurrency(total) : "–";
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tableData]);

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
		const typeFilterValue = filters.find(
			(f) => (f as LogicalFilter).field === "type",
		);
		return typeFilterValue as
			| (Omit<LogicalFilter, "value"> & { value: ExpenseType["type"] })
			| undefined;
	}, [filters]);

	const setType = useCallback(
		(type: TypeFilterType) => {
			setFilters((prev) => {
				const otherFilters = prev.filter(
					(f) => (f as LogicalFilter).field !== "type",
				);
				if (type === "All types") return otherFilters;
				return [
					...otherFilters,
					{ field: "type", operator: "eq", value: type },
				];
			});
		},
		[setFilters],
	);

	const categoryFilter = useMemo(() => {
		const categoryFilterValue = filters.find(
			(f) => (f as LogicalFilter).field === "category",
		);
		if (!categoryFilterValue) return undefined;
		return categoryFilterValue as Omit<LogicalFilter, "value"> & {
			value: ExpenseType["category"][];
		};
	}, [filters]);

	const setCategoryFilter = useCallback(
		(categories: ExpenseType["category"][]) => {
			setFilters((prev) => {
				const otherFilters = prev.filter(
					(f) => (f as LogicalFilter).field !== "category",
				);
				if (categories.length === 0) return otherFilters;
				return [
					...otherFilters,
					{ field: "category", operator: "in", value: categories },
				];
			});
		},
		[setFilters],
	);

	return (
		<div className="px-10 pb-8">
			<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
				<h1 className="font-special text-3xl antialiased">{RESOURCE_NAME}</h1>
				<Button variant="outline" onClick={() => create(RESOURCE_NAME)}>
					New {RESOURCE_NAME.toLocaleLowerCase().replace(/s$/, "")}
				</Button>
			</div>
			<div className="flex gap-6 justify-between items-center py-4 border-y border-grayLight my-4">
				<div className="flex items-center gap-4">
					<strong>Total per month:</strong>
					<span className="font-mono">{totalPerMonth}</span>
				</div>
				<div className="flex items-center gap-4">
					<MultiValueInput<ExpenseType["category"]>
						options={categoryOptions}
						values={categoryFilter?.value}
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
			<div className="w-full mb-6">
				{tableData && <DataTable table={table} />}
			</div>
		</div>
	);
}
