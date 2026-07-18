import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { z } from "zod";
import ExpenseHistoryPage from "@/features/expenses/ExpenseHistoryPage";
import { expenseHistoryMonthsQueryOptions } from "@/utility/data/queryOptions";
import { expenseHistoryMonthKeySchema } from "@/utility/expenseHistoryContracts";

const historySearchSchema = z.object({
	month: expenseHistoryMonthKeySchema.optional().catch(undefined),
});

export const Route = createFileRoute("/_resource/expenses/history")({
	validateSearch: historySearchSchema,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(expenseHistoryMonthsQueryOptions()),
	component: ExpenseHistoryRoute,
});

function ExpenseHistoryRoute() {
	const childMatches = useChildMatches();
	return childMatches.length > 0 ? <Outlet /> : <ExpenseHistoryPage />;
}
