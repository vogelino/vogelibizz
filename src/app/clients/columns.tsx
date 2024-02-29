import { ProjectType } from '@db/schema'
import { ColumnDef } from '@tanstack/react-table'
import {
	StatusType,
	mapStatusToIcon,
	mapStatusToLabel,
} from '@utility/statusUtil'
import { IconBadge } from '@components/ui/icon-badge'
import InternalLink from '@components/ui/internal-link'
import { getSortableHeaderTemplate } from '@components/DataTable/dataTableUtil'

export const projectTableColumns: ColumnDef<ProjectType>[] = [
	{
		id: 'id',
		accessorKey: 'id',
		size: 50,
		minSize: 50,
		maxSize: 50,
		header: getSortableHeaderTemplate<ProjectType>(
			<span className="text-xs font-mono text-grayDark group-hover:text-inherit">
				ID
			</span>,
		),
		cell: function render({ getValue }) {
			return (
				<span className="text-xs font-mono text-grayDark">
					{getValue<string>()}
				</span>
			)
		},
	},
	{
		id: 'name',
		accessorKey: 'name',
		size: 1000,
		header: getSortableHeaderTemplate<ProjectType>('Name'),
		cell: function render({ getValue, row }) {
			const id = row.original.id
			const value = getValue<string>()
			return <InternalLink href={`/clients/show/${id}`}>{value}</InternalLink>
		},
	},
]
