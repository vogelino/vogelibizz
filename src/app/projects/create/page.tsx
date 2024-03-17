import FormPageLayout from '@components/FormPageLayout'
import ProjectCreate from '@components/ProjectCreate'
import { Button } from '@components/ui/button'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ProjectCreatePageRoute() {
	return (
		<FormPageLayout
			title="Create Project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>
							<span>{'Cancel'}</span>
						</Link>
					</Button>
					<Button type="submit" form={`project-create-form`}>
						<SaveIcon />
						{'Create project'}
					</Button>
				</>
			}
		>
			<ProjectCreate />
		</FormPageLayout>
	)
}
