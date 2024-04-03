import ExpenseEdit from '@components/ExpenseEdit'
import FormPageLayout from '@components/FormPageLayout'
import { Button } from '@components/ui/button'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'

export default function ExpenseEditPageRoute({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<FormPageLayout
			id={id}
			title="Edit Expense"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses/show/${id}`}>
							<span>{'Cancel'}</span>
						</Link>
					</Button>
					<Button type="submit" form={`expense-edit-form-${id}`}>
						<SaveIcon />
						{'Save expense'}
					</Button>
				</>
			}
		>
			<ExpenseEdit id={id} />
		</FormPageLayout>
	)
}
