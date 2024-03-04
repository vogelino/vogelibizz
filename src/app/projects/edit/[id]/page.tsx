'use client'

import ProjectEdit from '@components/ProjectEdit'
import { Button } from '@components/ui/button'
import { useNavigation, useSelect } from '@refinedev/core'
import { SaveIcon } from 'lucide-react'
import React from 'react'

const RESOURCE_NAME = 'projects'

export default function ProjectEditPageRoute({
	params: { id },
}: {
	params: { id: string }
}) {
	const { list } = useNavigation()

	return (
		<div style={{ padding: '16px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<h1>Edit</h1>
				<div>
					<button onClick={() => list(RESOURCE_NAME)}>List</button>
				</div>
			</div>
			<ProjectEdit id={id} />

			<Button type="submit" form={`project-edit-form-${id}`}>
				<SaveIcon />
				{'save'}
			</Button>
		</div>
	)
}
