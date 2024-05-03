import { getExpenses } from "@/utility/data/useExpenses";
import { getExchangeRates } from "@/utility/expensesUtil";
import { QueryClient } from "@tanstack/react-query";
import ExpensesPage from "./ExpensesPage";

export default async function ExpensesPageServer() {
	const rates = await getExchangeRates();
	const queryClient = new QueryClient();
	queryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => getExpenses(),
	});
	return <ExpensesPage rates={rates} />;
}
