'use client'
import ProjectEdit from '@components/ProjectEdit'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ProjectType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { SaveIcon, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ProjectEditModalRoute({
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
			open={pathname === `/projects/edit/${id}`}
			title={record?.name || 'Edit'}
			description={'Edit Project'}
			onClose={() => router.push('/projects')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>Cancel</Link>
					</Button>
					{id && (
						<Button type="submit" form={`project-edit-form-${id}`}>
							<SaveIcon />
							{'Edit project'}
						</Button>
					)}
				</>
			}
		>
			<ProjectEdit id={id} />
		</ResponsiveModal>
	)
}
