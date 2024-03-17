'use client'
import ProjectDisplay from '@components/ProjectDisplay'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ProjectType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ProjectShow({
	params: { id },
}: {
	params: { id: string }
}) {
	const router = useRouter()
	const pathname = usePathname()
	const { queryResult } = useShow({
		resource: 'projects',
		id,
		meta: { select: '*' },
	})
	const record = queryResult.data?.data as ProjectType | undefined
	return (
		<ResponsiveModal
			open={pathname === `/projects/show/${id}`}
			title={record?.name || 'Show'}
			description={'Project details'}
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
								{'Edit project'}
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
