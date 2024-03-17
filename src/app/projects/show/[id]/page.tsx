import FormPageLayout from '@components/FormPageLayout'
import ProjectDisplay from '@components/ProjectDisplay'
import { Button } from '@components/ui/button'
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'

export default function ProjectShow({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<FormPageLayout
			id={id}
			title="Project details"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>
							<span>{'Cancel'}</span>
						</Link>
					</Button>
					{id && (
						<Button asChild>
							<Link href={`/projects/edit/${id}`}>
								<PencilIcon />
								{'Edit'}
							</Link>
						</Button>
					)}
				</>
			}
		>
			<ProjectDisplay id={id} />
		</FormPageLayout>
	)
}
