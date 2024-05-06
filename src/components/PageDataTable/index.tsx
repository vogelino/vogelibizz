"use client";

import { DataTable } from "@/components/DataTable";
import TablePagination from "@/components/DataTable/table-pagination";
import type { ProjectType, ResourceType } from "@/db/schema";
import { useActionsColumn } from "@/utility/useActionsColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

export default function PageDataTable<
	DataType extends Record<string, unknown>,
>({
	resource,
	columns: pageSpecificColumns,
	data,
	defaultSortColumn = "last_modified",
	deleteAction = () => undefined,
}: {
	resource: ResourceType;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<DataType, any>[];
	data: DataType[];
	defaultSortColumn: string;
	deleteAction: (id: number) => void;
}) {
	const actions = useActionsColumn<DataType>(deleteAction);
	const lastModifiedColumn = useLastModifiedColumn<ProjectType>();
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns = [
		...pageSpecificColumns,
		lastModifiedColumn,
		actions,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	] as ColumnDef<DataType, any>[];

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
		initialState: {
			sorting: [
				{
					id: defaultSortColumn,
					desc: true,
				},
			],
			pagination: { pageIndex: 0, pageSize: 50 },
		},
	});

	return (
		<>
			<div className="w-full mb-6">
				{data?.length > 0 && <DataTable table={table} />}
			</div>
			{table.getPageCount() > 1 && <TablePagination {...table} />}
		</>
	);
}
