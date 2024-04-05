'use client'
import ExpenseEdit from '@components/ExpenseEdit'
import PageHeaderTitle from '@components/PageHeaderTitle'
import { Button } from '@components/ui/button'
import { ResponsiveModal } from '@components/ui/responsive-dialog'
import { ExpenseType } from '@db/schema'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

function ExpenseEditModal(record: ExpenseType) {
	const { id, name } = record
	const router = useRouter()
	const pathname = usePathname()
	return (
		<ResponsiveModal
			open={pathname === `/expenses/edit/${id}`}
			title={<PageHeaderTitle name={name} id={`${id}`} />}
			description="Edit the expense's details"
			onClose={() => router.push('/expenses')}
			footer={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>Cancel</Link>
					</Button>
					<Button type="submit" form={`expense-edit-form-${id}`}>
						<SaveIcon />
						{'Edit expense'}
					</Button>
				</>
			}
		>
			<ExpenseEdit
				id={`${id}`}
				formId={`expense-edit-form-${id}`}
				initialData={record}
			/>
		</ResponsiveModal>
	)
}

export default ExpenseEditModal
