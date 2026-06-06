import { createFileRoute } from "@tanstack/react-router";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import { expensesQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/expenses/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(expensesQueryOptions()),
	component: ExpensesPage,
});
