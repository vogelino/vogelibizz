import ExpenseEdit from '@components/ExpenseEdit'
import FormPageLayout from '@components/FormPageLayout'
import { Button } from '@components/ui/button'
import { ExpenseType } from '@db/schema'
import { supabaseClient } from '@utility/supabase-client'
import { SaveIcon } from 'lucide-react'
import Link from 'next/link'

export default async function ExpenseEditPageRoute({
	params: { id },
}: {
	params: { id: string }
}) {
	const record = await supabaseClient
		.from('expenses')
		.select('*')
		.eq('id', id)
		.single()
	const data = record.data as ExpenseType
	return (
		<FormPageLayout
			id={id}
			title={data?.name || 'Edit expense'}
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>
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
			<ExpenseEdit
				id={id}
				formId={`expense-edit-form-${id}`}
				initialData={data}
			/>
		</FormPageLayout>
	)
}
