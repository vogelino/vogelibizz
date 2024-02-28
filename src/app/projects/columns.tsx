import { ProjectType } from '@db/schema'
import { ColumnDef } from '@tanstack/react-table'
import {
	StatusType,
	mapStatusToIcon,
	mapStatusToLabel,
} from '@utility/statusUtil'
import { IconBadge } from '@components/ui/icon-badge'
import InternalLink from '@components/ui/internal-link'
import { format } from '@formkit/tempo'

export const projectTableColumns: ColumnDef<ProjectType>[] = [
	{
		id: 'id',
		accessorKey: 'id',
		header: () => <span className="text-xs font-mono text-grayDark">ID</span>,
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
		header: 'Name',
		cell: function render({ getValue, row }) {
			const id = row.original.id
			const value = getValue<string>()
			return <InternalLink href={`/projects/show/${id}`}>{value}</InternalLink>
		},
	},
	{
		id: 'status',
		accessorKey: 'status',
		header: 'Status',
		cell: function render({ getValue }) {
			const value = getValue<StatusType>()
			return (
				<IconBadge
					icon={mapStatusToIcon(value)}
					label={mapStatusToLabel(value)}
				/>
			)
		},
	},
	{
		id: 'created_at',
		accessorKey: 'created_at',

		header: () => (
			<span className="text-xs font-mono text-grayDark">Created at</span>
		),
		cell: function render({ getValue }) {
			const formattedDate = format({
				date: new Date(),
				format: { date: 'medium' },
				tz: 'America/Santiago',
			})
			return (
				<span className="text-xs font-mono text-grayDark">{formattedDate}</span>
			)
		},
	},
]
