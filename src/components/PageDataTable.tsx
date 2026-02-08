"use client";

import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SelectionCheckbox } from "@/components/SelectionCheckbox";
import { useResourceActions } from "@/components/ResourcePageLayout";
import { Button } from "@/components/ui/button";
import type { ProjectType, ResourceType } from "@/db/schema";
import useClientDelete from "@/utility/data/useClientDelete";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useProjectDelete from "@/utility/data/useProjectDelete";
import { getDeleteColumn } from "@/utility/getDeleteColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";

export default function PageDataTable<
	DataType extends { id: number },
>({
	resource,
	columns: pageSpecificColumns,
	data,
	defaultSortColumn = "last_modified",
	loading = false,
}: {
	resource: ResourceType;
	// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	columns: ColumnDef<DataType, any>[];
	data: DataType[];
	defaultSortColumn: string;
	loading?: boolean;
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
	const selectionColumn = useMemo(
		() =>
			({
				id: "select",
				header: ({ table }) => (
					<SelectionCheckbox
						checked={table.getIsAllPageRowsSelected()}
						indeterminate={table.getIsSomePageRowsSelected()}
						onChange={(checked) =>
							table.toggleAllPageRowsSelected(checked)
						}
						ariaLabel="Select all rows"
					/>
				),
				cell: ({ row }) => (
					<SelectionCheckbox
						checked={row.getIsSelected()}
						indeterminate={row.getIsSomeSelected()}
						onChange={(checked) => row.toggleSelected(checked)}
						ariaLabel="Select row"
					/>
				),
				size: 36,
				enableSorting: false,
				enableHiding: false,
			}) as ColumnDef<DataType, unknown>,
		[],
	);
	const columns = [
		selectionColumn,
		...pageSpecificColumns,
		lastModifiedColumn,
		deleteColumn,
		// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	] as ColumnDef<DataType, any>[];

	const tableRef = useRef<TanstackTable<DataType> | null>(null);
	const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
	const selectionActions = useMemo(() => {
		if (selectedRows.length === 0) return null;
		return (
			<Button
				type="button"
				variant="destructive"
				size="sm"
				disabled={loading}
				onClick={() => {
					for (const row of selectedRows) {
						deleteAction(row.id);
					}
					setSelectedRows([]);
					tableRef.current?.resetRowSelection();
				}}
			>
				Delete selected ({selectedRows.length})
			</Button>
		);
	}, [deleteAction, loading, selectedRows]);
	useResourceActions(selectionActions);

	return (
		<div className="w-full mb-6">
			{(loading || data?.length > 0) && (
				<DataTable
					columns={columns}
					data={data}
					loading={loading}
					enableRowSelection
					onSelectionChange={setSelectedRows}
					initialState={{
						sorting: [{ id: defaultSortColumn, desc: true }],
						pagination: { pageIndex: 0, pageSize: 50 },
					}}
					toolbar={(table) => {
						tableRef.current = table;
						return null;
					}}
				/>
			)}
		</div>
	);
}
