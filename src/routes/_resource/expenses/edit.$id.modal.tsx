import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import { expenseQueryOptions } from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/edit/$id/modal")({
	loader: ({ context, params }) => {
		const parsedId = parseId(params.id);
		void context.queryClient.prefetchQuery(expenseQueryOptions(parsedId));
	},
	component: ExpenseEditModal,
});

function ExpenseEditModal() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const parsedId = parseId(id);
	if (!parsedId) return <ExpensesPage />;
	const formId = `expense-edit-form-${parsedId}`;

	return (
		<>
			<ExpensesPage />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit expense" id={parsedId} />}
				onClose={() => navigate({ to: "/expenses" })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/expenses" })}
							>
								Cancel
							</button>
						</Button>
						<Button type="submit" form={formId}>
							<SaveIcon />
							{"Save expense"}
						</Button>
					</>
				}
			>
				<ExpenseEdit id={parsedId} formId={formId} />
			</ResponsiveModal>
		</>
	);
}
