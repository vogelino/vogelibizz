import { ExpenseType } from '@db/schema'
import { supabaseClient } from '@utility/supabase-client'
import ExpenseEditModal from './expenseEditModal'

export default async function ExpenseEditModalRoute({
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
	return <ExpenseEditModal {...data} />
}
