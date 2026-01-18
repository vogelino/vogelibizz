"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import type { ProjectType, ResourceType } from "@/db/schema";
import useClientDelete from "@/utility/data/useClientDelete";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useProjectDelete from "@/utility/data/useProjectDelete";
import { getDeleteColumn } from "@/utility/getDeleteColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";

export default function PageDataTable<
	DataType extends Record<string, unknown>,
>({
	resource,
	columns: pageSpecificColumns,
	data,
	defaultSortColumn = "last_modified",
}: {
	resource: ResourceType;
	// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	columns: ColumnDef<DataType, any>[];
	data: DataType[];
	defaultSortColumn: string;
}) {
	const clientDeleteMutation = useClientDelete();
	const projectDeleteMutation = useProjectDelete();
	const expenseDeleteMutation = useExpenseDelete();
	const deleteAction = useCallback(
		(id: number) => {
			switch (resource) {
				case "clients":
					return clientDeleteMutation.mutate(id);
				case "projects":
					return projectDeleteMutation.mutate(id);
				case "expenses":
					return expenseDeleteMutation.mutate(id);
			}
		},
		[
			resource,
			clientDeleteMutation,
			projectDeleteMutation,
			expenseDeleteMutation,
		],
	);
	const deleteColumn = getDeleteColumn<DataType>(deleteAction);
	const lastModifiedColumn = useLastModifiedColumn<ProjectType>();
	const columns = [
		...pageSpecificColumns,
		lastModifiedColumn,
		deleteColumn,
		// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	] as ColumnDef<DataType, any>[];

	return (
		<div className="w-full mb-6">
			{data?.length > 0 && (
				<DataTable
					columns={columns}
					data={data}
					initialState={{
						sorting: [{ id: defaultSortColumn, desc: true }],
						pagination: { pageIndex: 0, pageSize: 50 },
					}}
				/>
			)}
		</div>
	);
}
