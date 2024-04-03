'use client'
import ExpenseDisplay from '@components/ExpenseDisplay'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ExpenseType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ExpenseShow({
	params: { id },
}: {
	params: { id: string }
}) {
	const router = useRouter()
	const pathname = usePathname()
	const { queryResult } = useShow({
		resource: 'expenses',
		id,
		meta: { select: '*' },
	})
	const record = queryResult.data?.data as ExpenseType | undefined
	return (
		<ResponsiveModal
			open={pathname === `/expenses/show/${id}`}
			title={record?.name || 'Show'}
			description={'Expense details'}
			onClose={() => router.push('/expenses')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>Close</Link>
					</Button>
					{id && (
						<Button asChild>
							<Link href={`/expenses/edit/${id}`}>
								<PencilIcon />
								{'Edit'}
							</Link>
						</Button>
					)}
				</>
			}
		>
			<ExpenseDisplay id={id} />
		</ResponsiveModal>
	)
}
