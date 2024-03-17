import { ResourceType } from '@db/schema'
import { useNavigation } from '@refinedev/core'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Pencil } from 'lucide-react'
import { cn } from './classNames'

export function useActionsColumn<ColumnType = any>(
	ressource: ResourceType,
): ColumnDef<ColumnType> {
	const { show, edit } = useNavigation()
	return {
		id: 'actions',
		accessorKey: 'id',
		header: ' ',
		size: 50,
		cell: function render({ getValue }) {
			const id = String(getValue<ColumnType>())
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className={cn('w-8 h-8 p-0', 'focusable')}>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => show(ressource, id)}>
							<Eye size={20} />
							<span className="mt-1">Show details</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => edit(ressource, id)}>
							<Pencil size={20} />
							<span className="mt-1">Edit</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	}
}
