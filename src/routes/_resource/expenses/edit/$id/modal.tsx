import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import ExpenseEdit from "@/components/ExpenseEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
} from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/edit/$id/modal")({
	loader: async ({ params }) => {
		const parsedId = parseId(params.id);
		if (typeof window === "undefined") {
			const { getExpense } = await import("@/server/api/expenses/getExpense");
			const expense = await getExpense(parsedId);
			return { expense };
		}
		const expense = await createQueryFunction<ExpenseWithMonthlyCLPPriceType>({
			resourceName: "expenses",
			action: "querySingle",
			outputZodSchema: expenseWithMonthlyCLPPriceSchema,
			id: parsedId,
		})();
		return { expense };
	},
	component: ExpenseEditModal,
	pendingComponent: ExpenseEditModalPending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ExpenseEditModal() {
	const { id } = Route.useParams();
	const { expense } = Route.useLoaderData();
	const navigate = useNavigate();
	const isPending = useRouterState({ select: (state) => state.isLoading });
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
				<ExpenseEdit
					id={parsedId}
					formId={formId}
					initialData={expense}
					loading={isPending}
				/>
			</ResponsiveModal>
		</>
	);
}

function ExpenseEditModalPending() {
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
				footer={null}
			>
				<ExpenseEdit id={parsedId} formId={formId} loading />
			</ResponsiveModal>
		</>
	);
}
