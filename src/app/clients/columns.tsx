import { ClientType } from '@db/schema'
import { ColumnDef } from '@tanstack/react-table'
import InternalLink from '@components/ui/internal-link'
import { getSortableHeaderTemplate } from '@components/DataTable/dataTableUtil'

export const clientTableColumns: ColumnDef<ClientType>[] = [
	{
		id: 'id',
		accessorKey: 'id',
		size: 50,
		minSize: 50,
		maxSize: 50,
		header: getSortableHeaderTemplate<ClientType>(
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
		header: getSortableHeaderTemplate<ClientType>('Name'),
		cell: function render({ getValue, row }) {
			const id = row.original.id
			const value = getValue<string>()
			return <InternalLink href={`/clients/show/${id}`}>{value}</InternalLink>
		},
	},
]
