import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { getExchangeRates } from "@/utility/expensesUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ExpensesPage from "./ExpensesPage";

export const dynamic = "force-dynamic";
export default async function ExpensesPageServer() {
	const rates = await getExchangeRates();
	serverQueryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => db.query.expenses.findMany(),
	});
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ExpensesPage rates={rates} />
		</HydrationBoundary>
	);
}
