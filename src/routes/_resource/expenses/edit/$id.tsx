import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import {
	type ExpenseWithMonthlyCLPPriceType,
	expenseSelectSchema,
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
			outputZodSchema: expenseSelectSchema,
			id: parsedId,
		})();
		return { expense };
	},
	component: ExpenseEditPageRoute,
});

function ExpenseEditPageRoute() {
	const { id } = Route.useParams();
	const { expense } = Route.useLoaderData();
	const parsedId = parseId(id);
	if (!parsedId) return null;

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
			/>
		</FormPageLayout>
	);
}
