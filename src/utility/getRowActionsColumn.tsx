"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	CopyIcon,
	MoreHorizontalIcon,
	PencilIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utility/classNames";

type RowActionOptions<RowType> = {
	onEdit: (row: RowType) => void;
	onDuplicate: (row: RowType) => void;
	onDelete: (row: RowType) => void;
	canShowActions?: (row: RowType) => boolean;
};

export function getRowActionsColumn<RowType extends { id: string | number }>({
	onEdit,
	onDuplicate,
	onDelete,
	canShowActions = () => true,
	// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
}: RowActionOptions<RowType>): ColumnDef<RowType, any> {
	return {
		id: "actions",
		header: " ",
		size: 50,
		enableSorting: false,
		enableHiding: false,
		cell: ({ row }) =>
			canShowActions(row.original) ? (
				<RowActions
					row={row.original}
					onEdit={onEdit}
					onDuplicate={onDuplicate}
					onDelete={onDelete}
				/>
			) : null,
	};
}

function RowActions<RowType extends { id: string | number }>({
	row,
	onEdit,
	onDuplicate,
	onDelete,
}: {
	row: RowType;
	onEdit: (row: RowType) => void;
	onDuplicate: (row: RowType) => void;
	onDelete: (row: RowType) => void;
}) {
	const [confirmDelete, setConfirmDelete] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Open row actions">
						<MoreHorizontalIcon className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={() => onEdit(row)}>
						<PencilIcon className="size-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => onDuplicate(row)}>
						<CopyIcon className="size-4" />
						Duplicate
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onSelect={() => setConfirmDelete(true)}
					>
						<Trash2Icon className="size-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this item?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							item from the server.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className={cn(buttonVariants({ variant: "destructive" }))}
							onClick={() => onDelete(row)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
