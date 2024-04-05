import { IconBadge } from '@components/ui/icon-badge'
import InternalLink from '@components/ui/internal-link'
import { ProjectType } from '@db/schema'
import { createColumnHelper } from '@tanstack/react-table'
import {
	StatusType,
	mapStatusToIcon,
	mapStatusToLabel,
} from '@utility/statusUtil'

const columnHelper = createColumnHelper<ProjectType>()

export const projectTableColumns = [
	columnHelper.accessor('id', {
		size: 50,
		minSize: 50,
		maxSize: 50,
		header: () => (
			<span className="text-xs font-mono text-grayDark group-hover:text-inherit">
				ID
			</span>
		),
		cell: function render({ getValue }) {
			return (
				<span className="text-xs font-mono text-grayDark">
					{getValue<string>()}
				</span>
			)
		},
	}),
	columnHelper.accessor('name', {
		size: 1000,
		header: 'Name',
		cell: function render({ getValue, row }) {
			const id = row.original.id
			const value = getValue<string>()
			return <InternalLink href={`/projects/edit/${id}`}>{value}</InternalLink>
		},
	}),
	columnHelper.accessor('status', {
		size: 100,
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
	}),
]
