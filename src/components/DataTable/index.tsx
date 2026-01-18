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
	type SortingState,
	type Table as TanstackTable,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
};

export function DataTable<TData>({
	columns,
	data,
	initialState,
	toolbar,
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
		state: {
			sorting,
			columnFilters,
			pagination,
		},
	});

	const showPagination = table.getPageCount() > 1;

	return (
		<div className="space-y-4">
			{toolbar ? <div>{toolbar(table)}</div> : null}
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
													className={cn("group pl-0 pr-6 hover:bg-transparent hover:text-primary")}
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
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="relative">
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
