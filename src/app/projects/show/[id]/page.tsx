import ProjectDisplay from '@components/ProjectDisplay'
import { Button } from '@components/ui/button'
import { ListIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'

export default function ProjectShow({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<div className="p-4">
			<div className="flex items-center justify-between">
				<h1>{'Show'}</h1>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href={`/projects`}>
							<ListIcon />
							<span>{'List'}</span>
						</Link>
					</Button>
					{id && (
						<Button asChild>
							<Link href={`/projects/${id}/edit`}>
								<PencilIcon />
								{'Edit'}
							</Link>
						</Button>
					)}
				</div>
			</div>
			<ProjectDisplay id={id} />
		</div>
	)
}
