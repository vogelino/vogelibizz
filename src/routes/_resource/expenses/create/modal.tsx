import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import ExpenseEdit from "@/components/ExpenseEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";

export const Route = createFileRoute("/_resource/expenses/create/modal")({
	component: ExpenseCreateModal,
});

function ExpenseCreateModal() {
	const navigate = useNavigate();
	const formId = "expense-create-form";

	return (
		<>
			<ExpensesPage />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Create expense" />}
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
							{"Create expense"}
						</Button>
					</>
				}
			>
				<ExpenseEdit formId={formId} />
			</ResponsiveModal>
		</>
	);
}
