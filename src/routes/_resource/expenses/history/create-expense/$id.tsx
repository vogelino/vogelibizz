import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import ExpenseHistoryPage from "@/features/expenses/ExpenseHistoryPage";
import { expenseHistoryTransactionQueryOptions } from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";
import { ExpenseHistoryCreateExpenseOverlay } from "./$id/modal";

export const Route = createFileRoute(
	"/_resource/expenses/history/create-expense/$id",
)({
	loader: async ({ context, params }) => {
		const id = parseId(params.id);
		const detail = await context.queryClient.ensureQueryData(
			expenseHistoryTransactionQueryOptions(id),
		);
		return { detail };
	},
	component: ExpenseHistoryCreateExpenseRoute,
});

function ExpenseHistoryCreateExpenseRoute() {
	const childMatches = useChildMatches();
	const { id } = Route.useParams();
	const { detail } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<>
			<ExpenseHistoryPage />
			<ExpenseHistoryCreateExpenseOverlay id={id} month={detail.month} />
		</>
	);
}
