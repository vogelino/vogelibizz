'use client'
import ProjectEdit from '@components/ProjectEdit'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
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
	return (
		<ResponsiveModal
			open={pathname === `/projects/edit/${id}`}
			title={'Edit'}
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
							{'save'}
						</Button>
					)}
				</>
			}
		>
			<ProjectEdit id={id} />
		</ResponsiveModal>
	)
}
