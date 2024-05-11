"use client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { parseId } from "./resourceUtil";

export function getDeleteColumn<ColumnType = unknown>(
	deleteAction: (id: number) => void = () => undefined,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): ColumnDef<ColumnType, any> {
	return {
		id: "actions",
		accessorKey: "id",
		header: " ",
		size: 50,
		enableSorting: false,
		cell: function render({ getValue }) {
			const id = parseId(getValue<ColumnType>());
			return (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="ghost" size="icon">
							<Trash className="h-4 w-4" />
							<span className="sr-only">Delete</span>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone.
								<br />
								This will permanently delete your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => deleteAction(id)}>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			);
		},
	};
}
