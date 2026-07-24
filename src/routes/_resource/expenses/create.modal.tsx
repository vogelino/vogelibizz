import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import { expenseQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/expenses/create/modal")({
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: ({ context, deps }) =>
		deps.duplicateId
			? context.queryClient.ensureQueryData(
					expenseQueryOptions(deps.duplicateId),
				)
			: undefined,
	component: ExpenseCreateModal,
});

function ExpenseCreateModal() {
	const duplicate = Route.useLoaderData();
	const navigate = useNavigate();
	const formId = "expense-create-form";

	return (
		<>
			<ExpensesPage />
			<ResponsiveModal
				open
				title={
					<PageHeaderTitle
						name={duplicate ? "Duplicate expense" : "Create expense"}
					/>
				}
				onClose={() =>
					navigate({
						to: "/expenses",
						search: (previous) => ({
							...previous,
							duplicateId: undefined,
						}),
					})
				}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() =>
									navigate({
										to: "/expenses",
										search: (previous) => ({
											...previous,
											duplicateId: undefined,
										}),
									})
								}
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
				<ExpenseEdit
					formId={formId}
					initialData={
						duplicate
							? { ...duplicate, name: `copy ${duplicate.name}` }
							: undefined
					}
				/>
			</ResponsiveModal>
		</>
	);
}
