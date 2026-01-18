import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getExpenses } from "@/app/api/expenses/getExpenses";
import createServerQueryClient from "@/utility/data/serverQueryClient";
import ExpensesPage from "./ExpensesPage";

export const dynamic = "force-dynamic";
export default async function ExpensesPageServer() {
	const expenses = await getExpenses();
	const serverQueryClient = createServerQueryClient();
	serverQueryClient.setQueryData(["expenses"], expenses);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ExpensesPage />
		</HydrationBoundary>
	);
}
