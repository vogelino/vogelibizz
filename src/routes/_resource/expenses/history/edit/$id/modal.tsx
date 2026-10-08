import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ExpenseHistoryPage from "@/features/expenses/ExpenseHistoryPage";
import ExpenseHistoryTransactionEditor from "@/features/expenses/ExpenseHistoryTransactionEditor";
import {
	expenseHistoryTransactionQueryOptions,
	expensesQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute(
	"/_resource/expenses/history/edit/$id/modal",
)({
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
	component: ExpenseHistoryTransactionEditModal,
});

function ExpenseHistoryTransactionEditModal() {
	const { id } = Route.useParams();
	const { detail } = Route.useLoaderData();
	return <ExpenseHistoryEditOverlay id={id} month={detail.month} />;
}

export function ExpenseHistoryEditOverlay({
	id,
	month,
}: {
	id: string;
	month: string;
}) {
	const navigate = useNavigate();
	const parsedId = parseId(id);
	const formId = `expense-history-transaction-${parsedId}`;
	const close = (selectedMonth = month) =>
		navigate({
			to: "/expenses/history",
			search: (previous) => ({ ...previous, month: selectedMonth }),
		});

	return (
		<>
			<ExpenseHistoryPage />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit bank transaction" id={parsedId} />}
				onClose={() => close()}
				footer={
					<>
						<Button type="button" variant="outline" onClick={() => close()}>
							Cancel
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
					onSaved={close}
				/>
			</ResponsiveModal>
		</>
	);
}
