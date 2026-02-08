"use client";

import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import ExpenseCategoryBadge from "@/components/ExpenseCategoryBadge";
import { PillText } from "@/components/PillText";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useResourceActions } from "@/components/ResourcePageLayout";
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
	const [selectedRows, setSelectedRows] = useState<
		ExpenseWithMonthlyCLPPriceType[]
	>([]);
	const tableRef = useRef<TanstackTable<ExpenseWithMonthlyCLPPriceType> | null>(
		null,
	);

	const { data = [], error, isPending } = useExpenses();
	const settingsQuery = useSettings();
	const targetCurrency = settingsQuery.data?.targetCurrency ?? "CLP";
	const isLoading = loading || isPending;

	// biome-ignore lint/correctness/useExhaustiveDependencies: columns are stable from constants
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
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
						aria-label="Select row"
					/>
				),
				size: 36,
				enableSorting: false,
				enableHiding: false,
			}) as ColumnDef<ExpenseWithMonthlyCLPPriceType, unknown>,
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
			] as ColumnDef<ExpenseWithMonthlyCLPPriceType, any>[],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[targetCurrency, selectionColumn],
	);

	const {
		totalLabel,
		filteredLabel,
		showFilteredTotal,
		categorySeries,
		typeSeries,
	} = useMemo(() => {
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

		const categoryTotals = categoryFilter.length
			? getTotalsByKeys(
					filteredData,
					categoryFilter,
					(expense) => expense.category,
				)
			: getTotalsByKey(filteredData, (expense) => expense.category);
		const topCategories = categoryTotals.slice(0, 4);

		const typeTotals =
			typeFilter && typeFilter !== "All types"
				? getTotalsByKeys(
						filteredData,
						[String(typeFilter)],
						(expense) => expense.type,
					)
				: getTotalsByKey(filteredData, (expense) => expense.type);

		return {
			totalLabel: total ? formatCurrency(total, targetCurrency) : "–",
			filteredLabel: filtered ? formatCurrency(filtered, targetCurrency) : "–",
			showFilteredTotal: hasCategoryFilter || hasTypeFilter,
			categorySeries: topCategories,
			typeSeries: typeTotals,
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
						deleteMutation.mutate(row.id);
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
			<div className="p-4 bg-muted my-4">
				<div className="flex flex-wrap items-start justify-between gap-6">
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
					<div className="flex items-start gap-4">
						<MiniPieChart
							title="By category"
							series={categorySeries}
							colorForLabel={getCategoryStrokeColor}
							loading={isLoading}
						/>
						<MiniPieChart
							title="By type"
							series={typeSeries}
							colorForLabel={getTypeStrokeColor}
							loading={isLoading}
						/>
					</div>
				</div>
			</div>
			<div className="w-full mb-6">
				<DataTable
					columns={columns}
					data={!error && data.length > 0 ? data : []}
					loading={isLoading}
					enableRowSelection
					onSelectionChange={setSelectedRows}
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
							{(() => {
								tableRef.current = table;
								return null;
							})()}
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
							{showFilteredTotal ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isLoading}
									onClick={() => {
										setCategoryFilter([]);
										setTypeFilter("All types");
										table.getColumn("category")?.setFilterValue(undefined);
										table.getColumn("type")?.setFilterValue(undefined);
									}}
								>
									Clear filters
								</Button>
							) : null}
						</div>
					)}
				/>
			</div>
		</>
	);
}

function getTotalPerMonthValue(data: ExpenseWithMonthlyCLPPriceType[]) {
	return data.reduce((a, b) => {
		const monthlyPrice = b.clpMonthlyPrice;
		return a + (monthlyPrice ?? 0);
	}, 0);
}

function getTotalsByKey(
	data: ExpenseWithMonthlyCLPPriceType[],
	getKey: (expense: ExpenseWithMonthlyCLPPriceType) => string,
) {
	const totals = new Map<string, number>();
	for (const expense of data) {
		const key = getKey(expense);
		const next = (totals.get(key) ?? 0) + (expense.clpMonthlyPrice ?? 0);
		totals.set(key, next);
	}
	return [...totals.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value);
}

function getTotalsByKeys(
	data: ExpenseWithMonthlyCLPPriceType[],
	keys: string[],
	getKey: (expense: ExpenseWithMonthlyCLPPriceType) => string,
) {
	const totals = new Map<string, number>();
	for (const key of keys) {
		totals.set(key, 0);
	}
	for (const expense of data) {
		const key = getKey(expense);
		if (!totals.has(key)) continue;
		const next = (totals.get(key) ?? 0) + (expense.clpMonthlyPrice ?? 0);
		totals.set(key, next);
	}
	return [...totals.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value);
}

function MiniPieChart({
	title,
	series,
	colorForLabel,
	loading,
}: {
	title: string;
	series: { label: string; value: number }[];
	colorForLabel: (label: string) => string;
	loading: boolean;
}) {
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
	const minRatio =
		positiveCount > 0 ? Math.min(0.03, 1 / positiveCount) : 0;
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
										<circle
											cx={size / 2}
											cy={size / 2}
											r={radius}
											style={{ stroke }}
											strokeWidth={strokeWidth}
											strokeDasharray={dashArray}
											strokeDashoffset={dashOffset}
											fill="none"
											className="cursor-default"
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
										/>
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
