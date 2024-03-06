import ProjectDisplay from '@components/ProjectDisplay'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { cn } from '@utility/classNames'
import { ListIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'

export default function ProjectShow({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<div className="px-10 pb-8 max-w-3xl mx-auto">
			<div
				className={cn(
					'flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center',
					'border-b border-grayLight pb-6',
				)}
			>
				<h1 className="font-special text-3xl antialiased flex items-center gap-4">
					<span>Project Info</span>
					<Badge variant="outline" className="font-mono mt-1">
						{id}
					</Badge>
				</h1>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href={`/projects`}>
							<ListIcon />
							<span>{'List'}</span>
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
				</div>
			</div>
			<ProjectDisplay id={id} />
		</div>
	)
}
