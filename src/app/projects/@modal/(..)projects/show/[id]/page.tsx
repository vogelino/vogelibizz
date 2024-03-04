'use client'
import ProjectDisplay from '@components/ProjectDisplay'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { PencilIcon, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ProjectShow({
	params: { id },
}: {
	params: { id: string }
}) {
	const router = useRouter()
	const pathname = usePathname()
	return (
		<ResponsiveModal
			open={pathname === `/projects/show/${id}`}
			title={'Show'}
			description={'Show Project'}
			onClose={() => router.push('/projects')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>Close</Link>
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
		</ResponsiveModal>
	)
}
