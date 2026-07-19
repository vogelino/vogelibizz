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
import ExpenseHistoryCreateExpenseEditor from "@/features/expenses/ExpenseHistoryCreateExpenseEditor";
import { expenseHistoryTransactionQueryOptions } from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

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
	const navigate = useNavigate();
	const { id } = Route.useParams();
	if (childMatches.length > 0) return <Outlet />;
	const parsedId = parseId(id);
	const formId = `expense-history-create-expense-${parsedId}`;

	return (
		<FormPageLayout
			id={parsedId}
			title="Create recurring expense"
			allLink="/expenses/history"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/expenses/history/edit/$id" params={{ id }} search>
							Cancel
						</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						Create and associate
					</Button>
				</>
			}
		>
			<ExpenseHistoryCreateExpenseEditor
				id={parsedId}
				formId={formId}
				onCreated={(month) =>
					navigate({
						to: "/expenses/history",
						search: (previous) => ({ ...previous, month }),
					})
				}
			/>
		</FormPageLayout>
	);
}
