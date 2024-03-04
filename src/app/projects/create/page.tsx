'use client'

import ProjectCreate from '@components/ProjectCreate'
import { useNavigation } from '@refinedev/core'

const RESOURCE_NAME = 'projects'

export default function ProjectCreatePageRoute() {
	const { list } = useNavigation()

	return (
		<div style={{ padding: '16px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<h1>Create</h1>
				<div>
					<button onClick={() => list(RESOURCE_NAME)}>List</button>
				</div>
			</div>
			<ProjectCreate />
		</div>
	)
}
