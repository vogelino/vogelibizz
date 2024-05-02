import { ExpenseType } from '@db/schema'
import { getExchangeRates } from '@utility/expensesUtil'
import { supabaseClient } from '@utility/supabase-client'
import ExpensesPage from './ExpensesPage'

export default async function ClientList() {
	const rates = await getExchangeRates()
	const initialData = await supabaseClient.from('expenses').select('*')
	const data = initialData.data as ExpenseType[]

	return <ExpensesPage rates={rates} initialData={data} />
}
