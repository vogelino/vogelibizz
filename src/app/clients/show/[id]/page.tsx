'use client'

import { useNavigation, useOne, useResource, useShow } from '@refinedev/core'

const RESOURCE_NAME = 'clients'
export default function ProjectShow() {
	const { edit, list } = useNavigation()
	const { id } = useResource()
	const { queryResult } = useShow({
		meta: {
			select: '*',
		},
	})
	const { data } = queryResult

	const record = data?.data

	return (
		<div style={{ padding: '16px' }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<h1>{'Show'}</h1>
				<div style={{ display: 'flex', gap: '8px' }}>
					<button onClick={() => list(RESOURCE_NAME)}>{'List'}</button>
					<button onClick={() => edit(RESOURCE_NAME, id ?? '')}>
						{'Edit'}
					</button>
				</div>
			</div>
			<div>
				<div style={{ marginTop: '6px' }}>
					<h5>{'ID'}</h5>
					<div>{record?.id ?? ''}</div>
				</div>
				<div style={{ marginTop: '6px' }}>
					<h5>{'Name'}</h5>
					<div>{record?.name}</div>
				</div>
				<div style={{ marginTop: '6px' }}>
					<h5>{'Created at'}</h5>
					<div>
						{new Date(record?.created_at).toLocaleString(undefined, {
							timeZone: 'UTC',
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
