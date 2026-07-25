import { createFileRoute } from "@tanstack/react-router";
import ExpenseDashboardPage from "@/features/expenses/ExpenseDashboardPage";
import { expenseDashboardQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/expenses/dashboard")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(expenseDashboardQueryOptions()),
	component: ExpenseDashboardPage,
});
