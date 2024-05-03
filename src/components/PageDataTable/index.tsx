"use client";

import { DataTable } from "@/components/DataTable";
import TablePagination from "@/components/DataTable/table-pagination";
import type { ResourceType } from "@/db/schema";
import type { ProjectType } from "@/utility/data/useProjects";
import { useActionsColumn } from "@/utility/useActionsColumn";
import { useDefaultSort } from "@/utility/useDefaultSort";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import {
	type ColumnDef,
	type SortingState,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export default function PageDataTable<
	DataType extends Record<string, unknown>,
>({
	resource,
	columns: pageSpecificColumns,
	data,
	defaultSortColumn = "last_modified",
}: {
	resource: ResourceType;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<DataType, any>[];
	data: DataType[];
	defaultSortColumn: string;
}) {
	const actions = useActionsColumn<DataType>(resource);
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
			pagination: { pageIndex: 0, pageSize: 50 },
		},
	});

	useDefaultSort({ setSorting, defaultColumnId: defaultSortColumn });

	return (
		<>
			<div className="w-full mb-6">
				{data?.length > 0 && <DataTable table={table} />}
			</div>
			<TablePagination {...table} />
		</>
	);
}
