"use client";

import { DataTable } from "@/components/DataTable";
import TablePagination from "@/components/DataTable/table-pagination";
import { Button } from "@/components/ui/button";
import type { ClientType } from "@/db/schema";
import useClients from "@/utility/data/useClients";
import { useActionsColumn } from "@/utility/useActionsColumn";
import { useDefaultSort } from "@/utility/useDefaultSort";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";
import { useNavigation } from "@refinedev/core";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { clientTableColumns } from "./columns";

const RESOURCE_NAME = "clients";
export default function ClientList() {
	const { create } = useNavigation();
	const actions = useActionsColumn<ClientType>(RESOURCE_NAME);
	const lastModifiedColumn = useLastModifiedColumn<ClientType>();
	const { data, isPending, error } = useClients();

	const columns = [...clientTableColumns, lastModifiedColumn, actions];

	const table = useReactTable({
		columns,
		data: !error && data ? data : [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});
	const { setOptions, setSorting } = table;

	setOptions((prev) => ({
		...prev,
		meta: {
			...prev.meta,
		},
	}));

	useDefaultSort({ setSorting, defaultColumnId: "last_modified" });

	return (
		<div className="px-10 pb-8">
			<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
				<h1 className="font-special text-3xl antialiased">{RESOURCE_NAME}</h1>
				<Button variant="outline" onClick={() => create(RESOURCE_NAME)}>
					New {RESOURCE_NAME.toLocaleLowerCase().replace(/s$/, "")}
				</Button>
			</div>
			<div className="w-full mb-6">
				{!error && data?.length > 0 && <DataTable table={table} />}
			</div>
			<TablePagination {...table} />
		</div>
	);
}
