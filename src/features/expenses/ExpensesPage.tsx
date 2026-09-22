"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import BulkEditDrawer from "@/components/BulkEditDrawer";
import { CurrencySettingSelect } from "@/components/CurrencySettingSelect";
import { DataTable } from "@/components/DataTable";
import { useResourceActions } from "@/components/ResourcePageLayout";
import { SelectionActionBar } from "@/components/SelectionActionBar";
import { Checkbox } from "@/components/ui/checkbox";
import { CollapsibleRegion } from "@/components/ui/collapsible-region";
import { useFilterControls } from "@/components/ui/filter-bar";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import {
	amountSearchText,
	filterRowsByText,
} from "@/features/search/searchEngine";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useExpenseEdit from "@/utility/data/useExpenseEdit";
import useExpenseOverviewSummary from "@/utility/data/useExpenseOverviewSummary";
import useExpenses from "@/utility/data/useExpenses";
import useResourceBatchMutations from "@/utility/data/useResourceBatchMutations";
import useSettings from "@/utility/data/useSettings";
import { formatCurrency } from "@/utility/formatUtil";
import {
	getRowActionsColumn,
	type RowActionOptions,
	RowActionsContextMenu,
} from "@/utility/getRowActionsColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import { useUrlSearchState } from "@/utility/useUrlSearchState";
import { getExpensesTableColumns } from "./columns";
import { ExpenseFilter, type ExpenseFilterState } from "./ExpenseFilter";
import {
	ExpenseOverviewToggle,
	useExpenseOverviewVisibility,
} from "./ExpenseOverviewToggle";
import { ExpensesOverviewPanel } from "./ExpensesOverviewPanel";
import {
	createExpenseOverviewRows,
	type ExpenseOverviewRow,
	type ExpenseOverviewType,
	filterExpenseOverviewRows,
	limitChartSeries,
	mixedClassification,
	totalMonthlyAmount,
	totalsByClassification,
} from "./expenseOverviewRows";
import {
	getCategoryStrokeColor,
	getTypeStrokeColor,
	MiniPieChart,
} from "./MiniPieChart";

type TypeFilterType = ExpenseOverviewType | "All types";

type ExpenseUrlFilterState = {
	categories: ExpenseFilterState["category"];
	expenseType: ExpenseFilterState["type"];
	expenseOtherOnly: boolean;
};

const expenseFilterDefaults: ExpenseUrlFilterState = {
	categories: [],
	expenseType: "All types",
	expenseOtherOnly: false,
};

export default function ExpensesPage({
	loading = false,
}: {
	loading?: boolean;
}) {
	const navigate = useNavigate({ from: "/expenses" });
	const search = useSearch({ from: "/_resource/expenses" });
	const updateSearch = useCallback(
		(nextSearch: typeof search) =>
			navigate({ search: nextSearch, replace: true }),
		[navigate],
	);
	const [urlFilters, setUrlFilters] = useUrlSearchState(
		search,
		expenseFilterDefaults,
		updateSearch,
	);
	const filters: ExpenseFilterState = {
		category: urlFilters.categories,
		type: urlFilters.expenseType,
		otherOnly: urlFilters.expenseOtherOnly,
	};
	const setFilters = useCallback(
		(
			update:
				| ExpenseFilterState
				| ((previous: ExpenseFilterState) => ExpenseFilterState),
		) => {
			setUrlFilters((previous) => {
				const previousFilters: ExpenseFilterState = {
					category: previous.categories,
					type: previous.expenseType,
					otherOnly: previous.expenseOtherOnly,
				};
				const nextFilters =
					typeof update === "function" ? update(previousFilters) : update;
				return {
					categories: nextFilters.category,
					expenseType: nextFilters.type,
					expenseOtherOnly: nextFilters.otherOnly,
				};
			});
		},
		[setUrlFilters],
	);
	const deleteMutation = useExpenseDelete();
	const batchDeleteMutation = useResourceBatchMutations("expenses").remove;
	const editMutation = useExpenseEdit();
	const rowActions: RowActionOptions<ExpenseOverviewRow> = {
		onEdit: (row) => {
			if (row.kind !== "recurring") return;
			const id = String(row.id);
			navigate({
				to: "/expenses/edit/$id/modal",
				params: { id },
				search: true,
				mask: {
					to: "/expenses/edit/$id",
					params: { id },
					search: true,
					unmaskOnReload: true,
				},
			});
		},
		onDuplicate: (row) => {
			if (row.kind !== "recurring") return;
			navigate({
				to: "/expenses/create/modal",
				search: (previous) => ({ ...previous, duplicateId: row.id }),
				mask: {
					to: "/expenses/create",
					search: (previous) => ({ ...previous, duplicateId: row.id }),
					unmaskOnReload: true,
				},
			});
		},
		onDelete: (row) => {
			if (row.kind === "recurring") deleteMutation.mutate(row.id);
		},
		canShowActions: (row) => row.kind === "recurring",
	};
	const rowActionsColumn = getRowActionsColumn<ExpenseOverviewRow>(rowActions);
	const lastModifiedColumn = useLastModifiedColumn<ExpenseOverviewRow>();
	const [selectedRows, setSelectedRows] = useState<ExpenseOverviewRow[]>([]);
	const [bulkEditOpen, setBulkEditOpen] = useState(false);
	const tableRef = useRef<TanstackTable<ExpenseOverviewRow> | null>(null);
	const categoryFilter = filters.category;
	const typeFilter = filters.type;
	const hasActiveFilters =
		categoryFilter.length > 0 ||
		typeFilter !== "All types" ||
		filters.otherOnly;
	const filterControls = useFilterControls(hasActiveFilters);
	const overview = useExpenseOverviewVisibility();
	const resourceActions = useMemo(
		() => (
			<>
				{filterControls.action}
				<ExpenseOverviewToggle
					visible={overview.visible}
					onToggle={overview.toggle}
				/>
			</>
		),
		[filterControls.action, overview.toggle, overview.visible],
	);
	useResourceActions(resourceActions);

	const { data = [], error, isPending } = useExpenses();
	const overviewQuery = useExpenseOverviewSummary();
	const settingsQuery = useSettings();
	const targetCurrency =
		overviewQuery.data?.currency ?? settingsQuery.data?.targetCurrency ?? "CLP";
	const isLoading = loading || isPending || overviewQuery.isPending;
	const rows = useMemo(
		() => createExpenseOverviewRows(data, overviewQuery.data),
		[data, overviewQuery.data],
	);
	const visibleRows = useMemo(
		() =>
			filterRowsByText(
				rows,
				search.q,
				(row) => row.id,
				(row) =>
					[
						row.id,
						row.name,
						row.category,
						row.type,
						amountSearchText(row.monthlyAmount),
						row.realMonthlyAverage === null
							? null
							: amountSearchText(row.realMonthlyAverage),
						row.kind === "recurring"
							? [
									row.expense.rate,
									amountSearchText(
										row.expense.originalPrice,
										row.expense.originalCurrency,
									),
								].join(" ")
							: "other unassociated",
					]
						.filter(Boolean)
						.join(" "),
			),
		[rows, search.q],
	);
	const tableRows = useMemo(
		() =>
			filters.otherOnly
				? visibleRows.filter((row) => row.kind === "other")
				: visibleRows,
		[filters.otherOnly, visibleRows],
	);
	const editExpenseCell = useCallback(
		(
			row: Extract<ExpenseOverviewRow, { kind: "recurring" }>,
			change: Partial<typeof row.expense>,
		) => {
			const {
				clpMonthlyPrice: _clpMonthlyPrice,
				created_at,
				...expense
			} = row.expense;
			editMutation.mutate({
				...expense,
				...change,
				last_modified: new Date().toISOString(),
			});
		},
		[editMutation],
	);

	const selectionColumn = useMemo(
		() =>
			({
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(checked) => {
							table.toggleAllPageRowsSelected(Boolean(checked));
						}}
						aria-label="Select all rows"
						className="mr-4"
					/>
				),
				cell: ({ row }) =>
					row.original.kind === "recurring" ? (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(checked) =>
								row.toggleSelected(Boolean(checked))
							}
							aria-label={`Select ${row.original.name}`}
							className="mr-4"
						/>
					) : null,
				size: 36,
				enableSorting: false,
				enableHiding: false,
			}) as ColumnDef<ExpenseOverviewRow, unknown>,
		[],
	);

	const columns = useMemo(
		() =>
			[
				selectionColumn,
				...getExpensesTableColumns(targetCurrency, editExpenseCell),
				lastModifiedColumn,
				rowActionsColumn,
				// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
			] as ColumnDef<ExpenseOverviewRow, any>[],
		[
			targetCurrency,
			selectionColumn,
			rowActionsColumn,
			lastModifiedColumn,
			editExpenseCell,
		],
	);

	const {
		configuredTotalLabel,
		livingCostLabel,
		observedAverageLabel,
		filteredLabel,
		showFilteredTotal,
		categorySeries,
		typeSeries,
	} = useMemo(() => {
		const hasCategoryFilter = categoryFilter.length > 0;
		const hasTypeFilter = typeFilter !== "All types";
		const hasSearchFilter = Boolean(search.q) || filters.otherOnly;
		const filteredData = filterExpenseOverviewRows(
			tableRows,
			categoryFilter,
			(typeFilter ?? "All types") as TypeFilterType,
		);
		const filtered = totalMonthlyAmount(filteredData);

		const categoryTotals = categoryFilter.length
			? totalsByClassification(
					filteredData,
					(expense) => expense.category,
					categoryFilter,
				)
			: totalsByClassification(filteredData, (expense) => expense.category);
		const topCategories = limitChartSeries(categoryTotals);

		const typeTotals =
			typeFilter && typeFilter !== "All types"
				? totalsByClassification(filteredData, (expense) => expense.type, [
						String(typeFilter),
					])
				: totalsByClassification(filteredData, (expense) => expense.type);

		return {
			configuredTotalLabel: formatCurrency(
				overviewQuery.data?.configuredMonthlyTotal ??
					data.reduce((total, expense) => total + expense.clpMonthlyPrice, 0),
				targetCurrency,
			),
			livingCostLabel:
				overviewQuery.data?.livingCostEstimate === null || !overviewQuery.data
					? "–"
					: formatCurrency(
							overviewQuery.data.livingCostEstimate,
							targetCurrency,
						),
			observedAverageLabel:
				overviewQuery.data?.observedMonthlyAverage === null ||
				!overviewQuery.data
					? "–"
					: formatCurrency(
							overviewQuery.data.observedMonthlyAverage,
							targetCurrency,
						),
			filteredLabel: formatCurrency(filtered, targetCurrency),
			showFilteredTotal: hasCategoryFilter || hasTypeFilter || hasSearchFilter,
			categorySeries: topCategories,
			typeSeries: typeTotals,
		};
	}, [
		categoryFilter,
		data,
		overviewQuery.data,
		filters.otherOnly,
		search.q,
		tableRows,
		targetCurrency,
		typeFilter,
	]);

	const clearSelection = useCallback(() => {
		setSelectedRows([]);
		tableRef.current?.resetRowSelection();
	}, []);
	return (
		<>
			<SelectionActionBar
				selectedCount={selectedRows.length}
				disabled={isLoading}
				onClear={clearSelection}
				onEdit={() => setBulkEditOpen(true)}
				onDelete={() => {
					batchDeleteMutation.mutate(
						selectedRows.flatMap((row) =>
							row.kind === "recurring" ? [row.id] : [],
						),
					);
					clearSelection();
				}}
			/>
			<BulkEditDrawer
				resource="expenses"
				rows={selectedRows.flatMap((row) =>
					row.kind === "recurring" ? [row.expense] : [],
				)}
				open={bulkEditOpen}
				onClose={() => setBulkEditOpen(false)}
			/>
			<CollapsibleRegion open={overview.visible} className="sticky left-0">
				<ExpensesOverviewPanel
					loading={isLoading}
					filteredTotal={showFilteredTotal ? filteredLabel : null}
					configuredTotal={configuredTotalLabel}
					livingCost={livingCostLabel}
					observedAverage={observedAverageLabel}
					categoryChart={
						<MiniPieChart
							title="By category"
							series={categorySeries}
							colorForLabel={getCategoryStrokeColor}
							loading={isLoading}
							onSegmentClick={(label) => {
								const nextCategory = [
									...expenseCategoryEnum.enumValues,
									mixedClassification,
								].find((value) => value === label);
								if (!nextCategory) return;
								setFilters((previous) => ({
									...previous,
									category: [nextCategory],
									type: "All types",
								}));
							}}
						/>
					}
					typeChart={
						<MiniPieChart
							title="By type"
							series={typeSeries}
							colorForLabel={getTypeStrokeColor}
							loading={isLoading}
							onSegmentClick={(label) => {
								const nextType = [
									...expenseTypeEnum.enumValues,
									mixedClassification,
								].find((value) => value === label);
								if (!nextType) return;
								setFilters((previous) => ({
									...previous,
									category: [],
									type: nextType,
								}));
							}}
						/>
					}
				/>
			</CollapsibleRegion>
			<DataTable
				columns={columns}
				data={!error && tableRows.length > 0 ? tableRows : []}
				loading={isLoading}
				enableRowSelection={(row) => row.original.kind === "recurring"}
				onSelectionChange={setSelectedRows}
				rowContextMenu={(row, trigger) =>
					rowActions.canShowActions?.(row) ? (
						<RowActionsContextMenu key={row.id} row={row} {...rowActions}>
							{trigger}
						</RowActionsContextMenu>
					) : (
						trigger
					)
				}
				toolbarVisible={filterControls.visible}
				toolbarSkeleton={
					<div className="px-6 md:px-10 sticky left-0 pt-3">
						<ExpenseFilter loading showMixedClassification />
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
				classNames={{
					toolbarContainer: "top-26",
					header: filterControls.visible ? "top-40 pt-3" : "top-26",
				}}
				toolbar={(table) => (
					<div className="px-6 md:px-10 sticky left-0 pt-3 flex justify-between items-center gap-8 flex-wrap">
						{(() => {
							tableRef.current = table;
							return null;
						})()}
						<ExpenseFilter
							loading={false}
							table={table}
							filters={filters}
							onFiltersChange={setFilters}
							showMixedClassification
						/>
						<CurrencySettingSelect />
					</div>
				)}
			/>
		</>
	);
}
