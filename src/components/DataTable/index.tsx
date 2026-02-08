"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type Table as TanstackTable,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/utility/classNames";

type DataTableProps<TData> = {
	// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	columns: ColumnDef<TData, any>[];
	data: TData[];
	initialState?: {
		sorting?: SortingState;
		columnFilters?: ColumnFiltersState;
		pagination?: PaginationState;
	};
	toolbar?: (table: TanstackTable<TData>) => ReactNode;
	loading?: boolean;
	skeletonRows?: number;
	toolbarSkeleton?: ReactNode;
	enableRowSelection?: boolean;
	onSelectionChange?: (rows: TData[]) => void;
};

export function DataTable<TData>({
	columns,
	data,
	initialState,
	toolbar,
	loading = false,
	skeletonRows = 6,
	toolbarSkeleton,
	enableRowSelection = false,
	onSelectionChange,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>(
		initialState?.sorting ?? [],
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		initialState?.columnFilters ?? [],
	);
	const [pagination, setPagination] = useState<PaginationState>(
		initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
	);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		onRowSelectionChange: setRowSelection,
		enableRowSelection,
		state: {
			sorting,
			columnFilters,
			pagination,
			rowSelection,
		},
	});

	useEffect(() => {
		if (!enableRowSelection || !onSelectionChange) return;
		const selected = table.getSelectedRowModel().rows.map((row) => row.original);
		onSelectionChange(selected);
	}, [enableRowSelection, onSelectionChange, rowSelection, table]);

	const showPagination = table.getPageCount() > 1;

	return (
		<div className="space-y-4">
			{toolbar ? (
				<div>{loading ? (toolbarSkeleton ?? null) : toolbar(table)}</div>
			) : null}
			<div className="rounded-md">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const { column } = header;
									const sort = column.getIsSorted();
									const iconClass = cn(
										"ml-2 h-4 w-4",
										sort && "text-foreground",
									);
									const label = header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											);

									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											style={{ width: `${header.getSize()}px` }}
										>
											{column.getCanSort() ? (
												<Button
													variant="ghost"
													onClick={column.getToggleSortingHandler()}
													className={cn(
														"group pl-0 pr-6 hover:bg-transparent hover:text-primary",
													)}
												>
													{label}
													{!sort && <ArrowUpDown className={iconClass} />}
													{sort === "asc" && (
														<ArrowDown className={iconClass} />
													)}
													{sort === "desc" && <ArrowUp className={iconClass} />}
												</Button>
											) : (
												label
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading ? (
							[...Array(Math.max(1, skeletonRows))].map((_, rowIndex) => (
								<TableRow key={`skeleton-row-${rowIndex}`} className="relative">
									{table.getAllColumns().map((column, colIndex) => (
										<TableCell
											key={`skeleton-cell-${rowIndex}-${colIndex}`}
											style={{ width: `${column.getSize()}px` }}
										>
											<Skeleton className="h-5 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="relative"
									data-state={row.getIsSelected() ? "selected" : undefined}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{ width: `${cell.column.getSize()}px` }}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{showPagination ? (
				<div className="flex items-center justify-end space-x-2 py-4">
					<div className="flex-1 text-sm text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			) : null}
		</div>
	);
}
