'use client'
import ExpenseEdit from '@components/ExpenseEdit'
import PageHeaderTitle from '@components/PageHeaderTitle'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ExpenseType } from '@db/schema'
import { useShow } from '@refinedev/core'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ExpenseEditModalRoute() {
	const router = useRouter()
	const pathname = usePathname()
	const { queryResult } = useShow({
		resource: 'expenses',
		meta: { select: '*' },
	})
	const record = queryResult.data?.data as ExpenseType | undefined
	return (
		<ResponsiveModal
			open={pathname === `/expenses/create`}
			title={<PageHeaderTitle name="Create expense" />}
			onClose={() => router.push('/expenses')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>Cancel</Link>
					</Button>
					<Button type="submit" form={`expense-create-form`}>
						<SaveIcon />
						{'Create expense'}
					</Button>
				</>
			}
		>
			<ExpenseEdit formId={`expense-create-form`} />
		</ResponsiveModal>
	)
}
