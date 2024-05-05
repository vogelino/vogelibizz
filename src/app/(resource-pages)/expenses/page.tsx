import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { getExchangeRates } from "@/utility/expensesUtil";
import ExpensesPage from "./ExpensesPage";

export default async function ExpensesPageServer() {
	const rates = await getExchangeRates();
	serverQueryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => db.query.expenses.findMany(),
	});
	return <ExpensesPage rates={rates} />;
}
