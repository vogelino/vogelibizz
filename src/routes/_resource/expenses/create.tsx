import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import {
	expenseOverviewSummaryQueryOptions,
	expenseQueryOptions,
	expensesQueryOptions,
} from "@/utility/data/queryOptions";
import { ExpenseCreateOverlay } from "./create.modal";

export const Route = createFileRoute("/_resource/expenses/create")({
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: async ({ context, deps }) => {
		const [duplicate] = await Promise.all([
			deps.duplicateId
				? context.queryClient.ensureQueryData(
						expenseQueryOptions(deps.duplicateId),
					)
				: undefined,
			context.queryClient.ensureQueryData(expensesQueryOptions()),
			context.queryClient.ensureQueryData(expenseOverviewSummaryQueryOptions()),
		]);
		return duplicate;
	},
	component: ExpenseCreatePageRoute,
});

function ExpenseCreatePageRoute() {
	const childMatches = useChildMatches();
	const duplicate = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return <ExpenseCreateOverlay duplicate={duplicate} />;
}
