'use client'
import ExpenseEdit from '@components/ExpenseEdit'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ExpenseType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ExpenseEditModalRoute({
	params: { id },
}: {
	params: { id: string }
}) {
	const router = useRouter()
	const pathname = usePathname()
	const { queryResult } = useShow({
		resource: 'clients',
		id,
		meta: { select: '*' },
	})
	const record = queryResult.data?.data as ExpenseType | undefined
	return (
		<ResponsiveModal
			open={pathname === `/expenses/edit/${id}`}
			title={record?.name || 'Edit'}
			description={'Edit Expense'}
			onClose={() => router.push('/expenses')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>Cancel</Link>
					</Button>
					{id && (
						<Button type="submit" form={`expense-edit-form-${id}`}>
							<SaveIcon />
							{'Edit client'}
						</Button>
					)}
				</>
			}
		>
			<ExpenseEdit id={id} />
		</ResponsiveModal>
	)
}
