import { getExpenses } from "@/app/api/expenses/getExpenses";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ExpensesPage from "./ExpensesPage";

export const dynamic = "force-dynamic";
export default async function ExpensesPageServer() {
	await serverQueryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: getExpenses,
	});
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ExpensesPage />
		</HydrationBoundary>
	);
}
