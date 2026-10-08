"use client";

import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import BulkEditDrawer from "@/components/BulkEditDrawer";
import { DataTable } from "@/components/DataTable";
import { SelectionActionBar } from "@/components/SelectionActionBar";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResourceType } from "@/db/schema";
import useClientDelete from "@/utility/data/useClientDelete";
import useExpenseDelete from "@/utility/data/useExpenseDelete";
import useInvoiceDelete from "@/utility/data/useInvoiceDelete";
import useProjectDelete from "@/utility/data/useProjectDelete";
import useResourceBatchMutations from "@/utility/data/useResourceBatchMutations";
import {
	getRowActionsColumn,
	type RowActionOptions,
	RowActionsContextMenu,
} from "@/utility/getRowActionsColumn";
import { useLastModifiedColumn } from "@/utility/useLastModifiedColumn";

export default function PageDataTable<DataType extends { id: number }>({
	resource,
	columns: pageSpecificColumns,
	data,
	defaultSortColumn = "last_modified",
	loading = false,
	toolbar,
	toolbarVisible = true,
	toolbarSkeleton,
	tableClassName,
	selectionColumnSize = 36,
	showLastModifiedColumn = true,
}: {
	resource: ResourceType;
	// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	columns: ColumnDef<DataType, any>[];
	data: DataType[];
	defaultSortColumn: string;
	loading?: boolean;
	toolbar?: (table: TanstackTable<DataType>) => ReactNode;
	toolbarVisible?: boolean;
	toolbarSkeleton?: ReactNode;
	tableClassName?: string;
	selectionColumnSize?: number;
	showLastModifiedColumn?: boolean;
}) {
	const navigate = useNavigate();
	const clientDeleteMutation = useClientDelete();
	const projectDeleteMutation = useProjectDelete();
	const expenseDeleteMutation = useExpenseDelete();
	const invoiceDeleteMutation = useInvoiceDelete();
	const clientBatchDelete = useResourceBatchMutations("clients").remove;
	const projectBatchDelete = useResourceBatchMutations("projects").remove;
	const expenseBatchDelete = useResourceBatchMutations("expenses").remove;
	const deleteAction = useCallback(
		(id: number) => {
			switch (resource) {
				case "clients":
					return clientDeleteMutation.mutate(id);
				case "projects":
					return projectDeleteMutation.mutate(id);
				case "expenses":
					return expenseDeleteMutation.mutate(id);
				case "invoices":
					return invoiceDeleteMutation.mutate(id);
			}
		},
		[
			resource,
			clientDeleteMutation,
			projectDeleteMutation,
			expenseDeleteMutation,
			invoiceDeleteMutation,
		],
	);
	const rowActions: RowActionOptions<DataType> = {
		onEdit: (row) => {
			const id = String(row.id);
			switch (resource) {
				case "clients":
					return navigate({
						to: "/clients/edit/$id/modal",
						params: { id },
						search: true,
						mask: {
							to: "/clients/edit/$id",
							params: { id },
							search: true,
							unmaskOnReload: true,
						},
					});
				case "projects":
					return navigate({
						to: "/projects/edit/$id/modal",
						params: { id },
						search: true,
						mask: {
							to: "/projects/edit/$id",
							params: { id },
							search: true,
							unmaskOnReload: true,
						},
					});
				case "expenses":
					return navigate({
						to: "/expenses/edit/$id/modal",
						params: { id },
						search: true,
						mask: {
							to: "/expenses/edit/$id",
							params: { id },
							search: true,
							unmaskOnReload: true,
						},
					});
				case "invoices":
					return navigate({
						to: "/invoices/$id",
						params: { id },
						search: true,
					});
			}
		},
		onDuplicate: (row) => {
			const duplicateId = row.id;
			switch (resource) {
				case "clients":
					return navigate({
						to: "/clients/create/modal",
						search: (previous) => ({ ...previous, duplicateId }),
						mask: {
							to: "/clients/create",
							search: (previous) => ({ ...previous, duplicateId }),
							unmaskOnReload: true,
						},
					});
				case "projects":
					return navigate({
						to: "/projects/create/modal",
						search: (previous) => ({ ...previous, duplicateId }),
						mask: {
							to: "/projects/create",
							search: (previous) => ({ ...previous, duplicateId }),
							unmaskOnReload: true,
						},
					});
				case "expenses":
					return navigate({
						to: "/expenses/create/modal",
						search: (previous) => ({ ...previous, duplicateId }),
						mask: {
							to: "/expenses/create",
							search: (previous) => ({ ...previous, duplicateId }),
							unmaskOnReload: true,
						},
					});
				case "invoices":
					return navigate({
						to: "/invoices/duplicate/$id/modal",
						params: { id: String(duplicateId) },
						search: true,
						mask: {
							to: "/invoices/create",
							search: (previous) => ({ ...previous, duplicateId }),
							unmaskOnReload: true,
						},
					});
			}
		},
		onDelete: (row) => deleteAction(row.id),
	};
	const rowActionsColumn = getRowActionsColumn<DataType>(rowActions);
	const lastModifiedColumn = useLastModifiedColumn<DataType>();
	const selectionColumn = useMemo(
		() =>
			({
				id: "select",
				header: ({ table }) => (
					<div className="w-8">
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
					</div>
				),
				cell: ({ row }) => (
					<div className="w-8">
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(checked) =>
								row.toggleSelected(Boolean(checked))
							}
							aria-label="Select row"
							className="mr-4"
						/>
					</div>
				),
				size: selectionColumnSize,
				enableSorting: false,
				enableHiding: false,
			}) as ColumnDef<DataType, unknown>,
		[selectionColumnSize],
	);
	const columns = [
		selectionColumn,
		...pageSpecificColumns,
		...(showLastModifiedColumn ? [lastModifiedColumn] : []),
		rowActionsColumn,
		// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
	] as ColumnDef<DataType, any>[];

	const tableRef = useRef<TanstackTable<DataType> | null>(null);
	const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
	const [bulkEditOpen, setBulkEditOpen] = useState(false);
	const bulkResource =
		resource === "clients" || resource === "projects" || resource === "expenses"
			? resource
			: null;
	const batchDeleteAction = useCallback(
		(ids: number[]) => {
			switch (bulkResource) {
				case "clients":
					return clientBatchDelete.mutate(ids);
				case "projects":
					return projectBatchDelete.mutate(ids);
				case "expenses":
					return expenseBatchDelete.mutate(ids);
			}
			for (const id of ids) deleteAction(id);
		},
		[
			bulkResource,
			clientBatchDelete,
			deleteAction,
			expenseBatchDelete,
			projectBatchDelete,
		],
	);
	const clearSelection = useCallback(() => {
		setSelectedRows([]);
		tableRef.current?.resetRowSelection();
	}, []);

	return (
		<div className="grow">
			<SelectionActionBar
				selectedCount={selectedRows.length}
				disabled={loading}
				onClear={clearSelection}
				onEdit={bulkResource ? () => setBulkEditOpen(true) : undefined}
				onDelete={() => {
					batchDeleteAction(selectedRows.map(({ id }) => id));
					clearSelection();
				}}
			/>
			{bulkResource && (
				<BulkEditDrawer
					resource={bulkResource}
					rows={selectedRows}
					open={bulkEditOpen}
					onClose={() => setBulkEditOpen(false)}
				/>
			)}
			{(loading || data?.length > 0 || toolbar) && (
				<DataTable
					columns={columns}
					data={data}
					loading={loading}
					onOpenRow={rowActions.onEdit}
					enableRowSelection
					onSelectionChange={setSelectedRows}
					rowContextMenu={(row, trigger) => (
						<RowActionsContextMenu key={row.id} row={row} {...rowActions}>
							{trigger}
						</RowActionsContextMenu>
					)}
					initialState={{
						sorting: [{ id: defaultSortColumn, desc: true }],
						pagination: { pageIndex: 0, pageSize: 50 },
					}}
					toolbarSkeleton={toolbarSkeleton}
					toolbarVisible={toolbarVisible}
					classNames={{
						table: tableClassName,
						header: toolbar && toolbarVisible ? "top-30 pt-3" : undefined,
					}}
					toolbar={(table) => {
						tableRef.current = table;
						return toolbar?.(table) ?? null;
					}}
				/>
			)}
		</div>
	);
}
