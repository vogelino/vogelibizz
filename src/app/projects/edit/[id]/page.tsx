import FormPageLayout from '@components/FormPageLayout'
import ProjectEdit from '@components/ProjectEdit'
import { Button } from '@components/ui/button'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ProjectEditPageRoute({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<FormPageLayout
			id={id}
			title="Edit Project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects/show/${id}`}>
							<span>{'Cancel'}</span>
						</Link>
					</Button>
					<Button type="submit" form={`project-edit-form-${id}`}>
						<SaveIcon />
						{'save'}
					</Button>
				</>
			}
		>
			<ProjectEdit id={id} />
		</FormPageLayout>
	)
}
