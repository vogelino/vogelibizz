'use client'
import ProjectCreate from '@components/ProjectCreate'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ProjectCreateModalRoute() {
	const router = useRouter()
	const pathname = usePathname()
	return (
		<ResponsiveModal
			open={pathname === `/projects/create`}
			title={'Create'}
			description={'Create Project'}
			onClose={() => router.push('/projects')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/projects`}>Cancel</Link>
					</Button>
				</>
			}
		>
			<ProjectCreate />
		</ResponsiveModal>
	)
}
