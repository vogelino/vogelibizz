import ExpensesPage from '@components/ExpensesPage'
import { getExchangeRates } from '@utility/expensesUtil'

export default async function ClientList() {
	const rates = await getExchangeRates()

	return <ExpensesPage rates={rates} />
}
