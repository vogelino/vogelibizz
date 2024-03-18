'use client'
import { IconBadge } from '@components/ui/icon-badge'
import { ProjectType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { mapStatusToIcon, mapStatusToLabel } from '@utility/statusUtil'
import Markdown from 'marked-react'

function ProjectDisplay({ id }: { id: string }) {
	const { queryResult } = useShow({
		resource: 'projects',
		id,
		meta: { select: '*' },
	})
	const isLoading = queryResult.isFetching
	const record = queryResult.data?.data as ProjectType | undefined

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!record) {
		return <div>No project found</div>
	}

	const { description, content, status } = record

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'Description'}</h5>
				<p>{description}</p>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'Status'}</h5>
				<IconBadge
					icon={mapStatusToIcon(status)}
					label={mapStatusToLabel(status)}
				/>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'Content'}</h5>
				<Markdown>{content || ''}</Markdown>
			</div>
		</div>
	)
}

export default ProjectDisplay
