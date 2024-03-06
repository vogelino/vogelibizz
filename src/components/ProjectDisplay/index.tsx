'use client'
import { IconBadge } from '@components/ui/icon-badge'
import { ProjectType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { mapStatusToIcon, mapStatusToLabel } from '@utility/statusUtil'
import React from 'react'

function ProjectDisplay({ id }: { id: string }) {
	const { queryResult } = useShow({
		resource: 'projects',
		id,
		meta: { select: '*' },
	})
	const record = queryResult.data?.data as ProjectType | undefined

	if (!record) {
		return <div>No project found</div>
	}

	const { name, status, created_at } = record

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'Name'}</h5>
				<div className="text-2xl">{name}</div>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'ID'}</h5>
				<div>{id ?? ''}</div>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'Status'}</h5>
				<IconBadge
					icon={mapStatusToIcon(status)}
					label={mapStatusToLabel(status)}
				/>
			</div>
			<div className="flex flex-col">
				<h5 className="text-grayDark">{'Created at'}</h5>
				<div>
					{new Date(created_at).toLocaleString('en-GB', {
						timeZone: 'UTC',
						dateStyle: 'medium',
						timeStyle: 'short',
					})}
				</div>
			</div>
		</div>
	)
}

export default ProjectDisplay
