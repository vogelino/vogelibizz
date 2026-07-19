"use client";

import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import { CurrencySettingSelect } from "@/components/CurrencySettingSelect";
import { DataTable } from "@/components/DataTable";
import { useResourceActions } from "@/components/ResourcePageLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { expenseCategoryEnum, expenseTypeEnum } from "@/db/schema";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useExpenseOverviewSummary from "@/utility/data/useExpenseOverviewSummary";
import useExpenses from "@/utility/data/useExpenses";
import useSettings from "@/utility/data/useSettings";
import { formatCurrency } from "@/utility/formatUtil";
import { getDeleteColumn } from "@/utility/getDeleteColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import { getExpensesTableColumns } from "./columns";
import { ExpenseFilter, type ExpenseFilterValue } from "./ExpenseFilter";
import { ExpensesOverviewPanel } from "./ExpensesOverviewPanel";
import {
	createExpenseOverviewRows,
	type ExpenseOverviewCategory,
	type ExpenseOverviewRow,
	type ExpenseOverviewType,
	filterExpenseOverviewRows,
	limitChartSeries,
	mixedClassification,
	totalMonthlyAmount,
	totalsByClassification,
} from "./expenseOverviewRows";

type TypeFilterType = ExpenseOverviewType | "All types";

export default function ExpensesPage({
	loading = false,
}: {
	loading?: boolean;
}) {
	const deleteMutation = useExpenseDelete();
	const deleteColumn = getDeleteColumn<ExpenseOverviewRow>(
		(id) => deleteMutation.mutate(id),
		(row) => row.kind === "recurring",
	);
	const lastModifiedColumn = useLastModifiedColumn<ExpenseOverviewRow>();
	const [categoryFilter, setCategoryFilter] = useState<
		ExpenseOverviewCategory[]
	>([]);
	const [typeFilter, setTypeFilter] = useState<ExpenseFilterValue>("All types");
	const [selectedRows, setSelectedRows] = useState<ExpenseOverviewRow[]>([]);
	const tableRef = useRef<TanstackTable<ExpenseOverviewRow> | null>(null);

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
				...getExpensesTableColumns(targetCurrency),
				lastModifiedColumn,
				deleteColumn,
				// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
			] as ColumnDef<ExpenseOverviewRow, any>[],
		[targetCurrency, selectionColumn, deleteColumn, lastModifiedColumn],
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
		const filteredData = filterExpenseOverviewRows(
			rows,
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
			showFilteredTotal: hasCategoryFilter || hasTypeFilter,
			categorySeries: topCategories,
			typeSeries: typeTotals,
		};
	}, [
		categoryFilter,
		data,
		overviewQuery.data,
		rows,
		targetCurrency,
		typeFilter,
	]);

	const selectionActions = useMemo(() => {
		if (selectedRows.length === 0) return null;
		return (
			<Button
				type="button"
				variant="destructive"
				size="sm"
				disabled={isLoading}
				onClick={() => {
					for (const row of selectedRows) {
						if (row.kind === "recurring") deleteMutation.mutate(row.id);
					}
					setSelectedRows([]);
					tableRef.current?.resetRowSelection();
				}}
			>
				Delete selected ({selectedRows.length})
			</Button>
		);
	}, [deleteMutation, isLoading, selectedRows]);
	useResourceActions(selectionActions);
	return (
		<>
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
							setCategoryFilter([nextCategory]);
							tableRef.current
								?.getColumn("category")
								?.setFilterValue([nextCategory]);
							setTypeFilter("All types");
							tableRef.current?.getColumn("type")?.setFilterValue(undefined);
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
							setTypeFilter(nextType);
							tableRef.current?.getColumn("type")?.setFilterValue(nextType);
							setCategoryFilter([]);
							tableRef.current
								?.getColumn("category")
								?.setFilterValue(undefined);
						}}
					/>
				}
			/>
			<DataTable
				columns={columns}
				data={!error && rows.length > 0 ? rows : []}
				loading={isLoading}
				enableRowSelection={(row) => row.original.kind === "recurring"}
				onSelectionChange={setSelectedRows}
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
					header: "top-30 pt-3",
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
							showMixedClassification
						/>
						<CurrencySettingSelect />
					</div>
				)}
			/>
		</>
	);
}

function MiniPieChart({
	title,
	series,
	colorForLabel,
	loading,
	onSegmentClick,
}: {
	title: string;
	series: { label: string; value: number }[];
	colorForLabel: (label: string) => string;
	loading: boolean;
	onSegmentClick?: (label: string) => void;
}) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [tooltip, setTooltip] = useState<{
		label: string;
		percent: string;
		color: string;
		x: number;
		y: number;
		visible: boolean;
	}>({
		label: "",
		percent: "0%",
		color: "#94a3b8",
		x: 0,
		y: 0,
		visible: false,
	});

	if (loading) {
		return (
			<div className="flex flex-col gap-2">
				<span className="text-xs text-muted-foreground">{title}</span>
				<Skeleton className="h-10 w-28" />
			</div>
		);
	}

	const trimmedSeries = series.slice(0, 4);
	const total = trimmedSeries.reduce((acc, item) => acc + item.value, 0);
	const positiveSeries = trimmedSeries.filter((item) => item.value > 0);
	const positiveCount = positiveSeries.length;
	const minRatio = positiveCount > 0 ? Math.min(0.03, 1 / positiveCount) : 0;
	const smallItems = positiveSeries.filter(
		(item) => item.value / total < minRatio,
	);
	const largeItems = positiveSeries.filter(
		(item) => item.value / total >= minRatio,
	);
	const totalLarge = largeItems.reduce((acc, item) => acc + item.value, 0);
	const reservedRatio = minRatio * smallItems.length;
	const remainingRatio = Math.max(0, 1 - reservedRatio);
	const size = 48;
	const strokeWidth = 10;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	let offset = 0;
	return (
		<div className="flex flex-col gap-2">
			<span className="text-xs text-muted-foreground">{title}</span>
			<div
				ref={wrapperRef}
				className="relative rounded-md bg-background/70 px-2 py-1.5"
			>
				{tooltip.visible ? (
					<div
						className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border/40 bg-background px-2 py-1 text-xs text-foreground shadow-md flex flex-col"
						style={{ left: tooltip.x, top: tooltip.y }}
					>
						<span>{tooltip.label}</span>
						<span className="flex items-center gap-1">
							<span
								className="inline-flex h-2 w-2 rounded-full"
								style={{ backgroundColor: tooltip.color }}
							/>
							{tooltip.percent}
						</span>
					</div>
				) : null}
				<TooltipProvider>
					<svg
						width={size}
						height={size}
						viewBox={`0 0 ${size} ${size}`}
						aria-hidden="true"
					>
						<circle
							cx={size / 2}
							cy={size / 2}
							r={radius}
							className="stroke-muted-foreground/15"
							strokeWidth={strokeWidth}
							fill="none"
						/>
						{trimmedSeries.map((item) => {
							const baseRatio = total ? item.value / total : 0;
							const ratio =
								item.value === 0
									? 0
									: baseRatio < minRatio
										? minRatio
										: totalLarge > 0
											? (item.value / totalLarge) * remainingRatio
											: baseRatio;
							const dash = ratio * circumference;
							const dashArray = `${dash} ${circumference - dash}`;
							const dashOffset = circumference - offset;
							const stroke = colorForLabel(item.label);
							offset += dash;
							const percentLabel = total
								? `${Math.round(baseRatio * 100)}%`
								: "0%";
							return (
								<Tooltip key={item.label}>
									<TooltipTrigger asChild>
										{/* biome-ignore lint/a11y/useSemanticElements: SVG segments need pointer events; no semantic button in SVG */}
										<g
											role="button"
											tabIndex={0}
											aria-label={
												onSegmentClick
													? `Filter by ${item.label}`
													: `${item.label} segment`
											}
											aria-disabled={onSegmentClick ? undefined : true}
											className={
												onSegmentClick ? "cursor-pointer" : "cursor-default"
											}
											onMouseEnter={(event) => {
												const bounds =
													wrapperRef.current?.getBoundingClientRect();
												if (!bounds) return;
												setTooltip({
													label: item.label,
													percent: percentLabel,
													color: stroke,
													x: event.clientX - bounds.left,
													y: event.clientY - bounds.top,
													visible: true,
												});
											}}
											onMouseMove={(event) => {
												const bounds =
													wrapperRef.current?.getBoundingClientRect();
												if (!bounds) return;
												setTooltip((prev) => ({
													...prev,
													color: stroke,
													x: event.clientX - bounds.left,
													y: event.clientY - bounds.top,
												}));
											}}
											onMouseLeave={() => {
												setTooltip((prev) => ({ ...prev, visible: false }));
											}}
											onClick={() => onSegmentClick?.(item.label)}
											onKeyDown={(event) => {
												if (!onSegmentClick) return;
												if (event.key === "Enter" || event.key === " ") {
													event.preventDefault();
													onSegmentClick(item.label);
												}
											}}
										>
											<circle
												cx={size / 2}
												cy={size / 2}
												r={radius}
												style={{ stroke }}
												strokeWidth={strokeWidth}
												strokeDasharray={dashArray}
												strokeDashoffset={dashOffset}
												fill="none"
											/>
										</g>
									</TooltipTrigger>
									<TooltipContent>
										{item.label} · {percentLabel}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</svg>
				</TooltipProvider>
			</div>
		</div>
	);
}

const categoryStrokeColors: Record<string, string> = {
	Charity: "#ef4444",
	Transport: "#3b82f6",
	Domain: "#22c55e",
	Entertainment: "#eab308",
	Essentials: "#a855f7",
	Hardware: "#ec4899",
	"Health & Wellbeing": "#f97316",
	Hobby: "#6366f1",
	Home: "#6b7280",
	Present: "#14b8a6",
	Savings: "#84cc16",
	Services: "#f59e0b",
	Software: "#8b5cf6",
	Travel: "#10b981",
	Administrative: "#0ea5e9",
};

function getCategoryStrokeColor(label: string) {
	return categoryStrokeColors[label] ?? "#94a3b8";
}

function getTypeStrokeColor(label: string) {
	if (label === "Freelance") return "#ef4444";
	if (label === "Personal") return "#3b82f6";
	return "#94a3b8";
}
