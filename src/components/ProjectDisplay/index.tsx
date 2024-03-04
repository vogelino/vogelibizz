'use client'
import { ProjectType } from '@db/schema'
import { useShow } from '@refinedev/core'
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
		<div>
			<div className="mt-4">
				<h5>{'ID'}</h5>
				<div>{id ?? ''}</div>
			</div>
			<div className="mt-4">
				<h5>{'Name'}</h5>
				<div>{name}</div>
			</div>
			<div className="mt-4">
				<h5>{'Status'}</h5>
				<div>{status}</div>
			</div>
			<div className="mt-4">
				<h5>{'Created at'}</h5>
				<div>
					{new Date(created_at).toLocaleString(undefined, {
						timeZone: 'UTC',
					})}
				</div>
			</div>
		</div>
	)
}

export default ProjectDisplay
