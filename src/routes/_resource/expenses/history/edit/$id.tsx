import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
	useNavigate,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import ExpenseHistoryTransactionEditor from "@/features/expenses/ExpenseHistoryTransactionEditor";
import {
	expenseHistoryTransactionQueryOptions,
	expensesQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/history/edit/$id")({
	loader: async ({ context, params }) => {
		const id = parseId(params.id);
		const [detail] = await Promise.all([
			context.queryClient.ensureQueryData(
				expenseHistoryTransactionQueryOptions(id),
			),
			context.queryClient.ensureQueryData(expensesQueryOptions()),
		]);
		return { detail };
	},
	component: ExpenseHistoryTransactionEditRoute,
});

function ExpenseHistoryTransactionEditRoute() {
	const childMatches = useChildMatches();
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const { detail } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	const parsedId = parseId(id);
	const formId = `expense-history-transaction-${parsedId}`;

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit bank transaction"
			allLink="/expenses/history"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link
							to="/expenses/history"
							search={(previous) => ({
								...previous,
								month: detail.month,
							})}
						>
							Cancel
						</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						Save transaction
					</Button>
				</>
			}
		>
			<ExpenseHistoryTransactionEditor
				id={parsedId}
				formId={formId}
				onSaved={(month) =>
					navigate({
						to: "/expenses/history",
						search: (previous) => ({ ...previous, month }),
					})
				}
			/>
		</FormPageLayout>
	);
}
