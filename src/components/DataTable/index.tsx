"use client";

import {
	flexRender,
	type Table as ReactTableType,
} from "@tanstack/react-table";

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
import type { BaseRecord } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function DataTable<RecordType extends BaseRecord>({
	table,
}: {
	table: UseTableReturnType<RecordType> | ReactTableType<RecordType>;
}) {
	return (
		<>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const { column } = header;
								const sort = column.getIsSorted();
								const iconClass = cn("ml-2 h-4 w-4", sort && "text-fg");
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
												className={cn("-ml-4 hover:text-fg group")}
											>
												{label}
												{!sort && <ArrowUpDown className={iconClass} />}
												{sort === "asc" && <ArrowDown className={iconClass} />}
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
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										style={{ width: `${cell.column.getSize()}px` }}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
		</>
	);
}
