import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ExpenseHistoryCreateExpenseEditor from "@/features/expenses/ExpenseHistoryCreateExpenseEditor";
import ExpenseHistoryPage from "@/features/expenses/ExpenseHistoryPage";
import { expenseHistoryTransactionQueryOptions } from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute(
	"/_resource/expenses/history/create-expense/$id/modal",
)({
	loader: async ({ context, params }) => {
		const id = parseId(params.id);
		const detail = await context.queryClient.ensureQueryData(
			expenseHistoryTransactionQueryOptions(id),
		);
		return { detail };
	},
	component: ExpenseHistoryCreateExpenseModal,
});

function ExpenseHistoryCreateExpenseModal() {
	const navigate = useNavigate();
	const { id } = Route.useParams();
	const { detail } = Route.useLoaderData();
	const parsedId = parseId(id);
	const formId = `expense-history-create-expense-${parsedId}`;
	const closeToEditor = () =>
		navigate({
			to: "/expenses/history/edit/$id/modal",
			params: { id },
			search: { month: detail.month },
			mask: {
				to: "/expenses/history/edit/$id",
				params: { id },
				unmaskOnReload: true,
			},
		});
	const finish = (month: string) =>
		navigate({ to: "/expenses/history", search: { month } });

	return (
		<>
			<ExpenseHistoryPage />
			<ResponsiveModal
				open
				title={
					<PageHeaderTitle name="Create recurring expense" id={parsedId} />
				}
				onClose={closeToEditor}
				footer={
					<>
						<Button type="button" variant="outline" onClick={closeToEditor}>
							Cancel
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
					onCreated={finish}
				/>
			</ResponsiveModal>
		</>
	);
}
