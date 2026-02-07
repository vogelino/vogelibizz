import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
} from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/edit/$id")({
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
	component: ExpenseEditPageRoute,
	pendingComponent: ExpenseEditPagePending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ExpenseEditPageRoute() {
	const { id } = Route.useParams();
	const { expense } = Route.useLoaderData();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const isPending = useRouterState({ select: (state) => state.isLoading });

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit expense"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/expenses">
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`expense-edit-form-${parsedId}`}>
						<SaveIcon />
						{"Save expense"}
					</Button>
				</>
			}
		>
			<ExpenseEdit
				id={parsedId}
				formId={`expense-edit-form-${parsedId}`}
				initialData={expense}
				loading={isPending}
			/>
		</FormPageLayout>
	);
}

function ExpenseEditPagePending() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `expense-edit-form-${parsedId}`;
	return (
		<FormPageLayout
			id={parsedId}
			title="Edit expense"
			allLink="/expenses"
			footerButtons={null}
		>
			<ExpenseEdit id={parsedId} formId={formId} loading />
		</FormPageLayout>
	);
}
