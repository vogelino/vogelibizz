import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ResourceType } from "@db/schema";
import { useDelete, useNavigation } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { cn } from "./classNames";

export function useActionsColumn<ColumnType = unknown>(
	resource: ResourceType,
): ColumnDef<ColumnType> {
	const { show, edit } = useNavigation();
	const { mutate: remove } = useDelete();
	return {
		id: "actions",
		accessorKey: "id",
		header: " ",
		size: 50,
		enableSorting: false,
		cell: function render({ getValue }) {
			const id = String(getValue<ColumnType>());
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
						<DropdownMenuItem onClick={() => show(resource, id)}>
							<Eye size={20} />
							<span className="mt-1">Show details</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => edit(resource, id)}>
							<Pencil size={20} />
							<span className="mt-1">Edit</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => remove({ resource, id })}>
							<Trash size={20} />
							<span className="mt-1">Delete</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	};
}
