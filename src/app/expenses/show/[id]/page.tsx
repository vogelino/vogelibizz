import ExpenseDisplay from '@components/ExpenseDisplay'
import FormPageLayout from '@components/FormPageLayout'
import { Button } from '@components/ui/button'
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'

export default function ExpenseShow({
	params: { id },
}: {
	params: { id: string }
}) {
	return (
		<FormPageLayout
			id={id}
			title="Expense details"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>
							<span>{'Cancel'}</span>
						</Link>
					</Button>
					{id && (
						<Button asChild>
							<Link href={`/expenses/edit/${id}`}>
								<PencilIcon />
								{'Edit expense'}
							</Link>
						</Button>
					)}
				</>
			}
		>
			<ExpenseDisplay id={id} />
		</FormPageLayout>
	)
}
