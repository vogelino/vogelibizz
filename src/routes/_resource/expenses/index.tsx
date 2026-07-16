import { createFileRoute } from "@tanstack/react-router";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import {
	expenseOverviewSummaryQueryOptions,
	expensesQueryOptions,
} from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/expenses/")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(expensesQueryOptions()),
			context.queryClient.ensureQueryData(expenseOverviewSummaryQueryOptions()),
		]),
	component: ExpensesPage,
});
