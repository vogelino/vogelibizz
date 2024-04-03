'use client'
import ExpenseCreate from '@components/ExpenseCreate'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function ExpenseCreateModalRoute() {
	const router = useRouter()
	const pathname = usePathname()
	return (
		<ResponsiveModal
			open={pathname === `/expenses/create`}
			title={'New Expense'}
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
			<ExpenseCreate />
		</ResponsiveModal>
	)
}
