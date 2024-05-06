"use client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash } from "lucide-react";
import { cn } from "./classNames";

export function useActionsColumn<ColumnType = unknown>(
	deleteAction: (id: number) => void = () => {},
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): ColumnDef<ColumnType, any> {
	return {
		id: "actions",
		accessorKey: "id",
		header: " ",
		size: 50,
		enableSorting: false,
		cell: function render({ getValue }) {
			const id = +String(getValue<ColumnType>());
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className={cn("w-8 h-8 p-0", "focusable")}>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => deleteAction(id)}>
							<Trash size={20} />
							<span className="mt-1">Delete</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	};
}
