import { ProjectType } from '@db/schema'
import { ColumnDef } from '@tanstack/react-table'
import {
	StatusType,
	mapStatusToIcon,
	mapStatusToLabel,
} from '@utility/statusUtil'
import { IconBadge } from '@components/ui/icon-badge'

export const projectTableColumns: ColumnDef<ProjectType>[] = [
	{
		id: 'id',
		accessorKey: 'id',
		header: 'ID',
	},
	{
		id: 'name',
		accessorKey: 'name',
		header: 'Name',
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
		header: 'Created At',

		cell: function render({ getValue }) {
			return new Date(getValue<Date>()).toLocaleString(undefined, {
				timeZone: 'UTC',
			})
		},
	},
]
