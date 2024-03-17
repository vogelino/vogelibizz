'use client'
import { ClientType } from '@db/schema'
import { useShow } from '@refinedev/core'
import React from 'react'

function ClientDisplay({ id }: { id: string }) {
	const { queryResult } = useShow({
		resource: 'clients',
		id,
		meta: { select: '*' },
	})
	const isLoading = queryResult.isFetching
	const record = queryResult.data?.data as ClientType | undefined

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!record) {
		return <div>No project found</div>
	}

	const { name } = record

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col">{name}</div>
		</div>
	)
}

export default ClientDisplay
