import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/edit/$id")({
	component: ExpenseEditPageRoute,
});

function ExpenseEditPageRoute() {
	const { id } = Route.useParams();
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
			<ExpenseEdit id={parsedId} formId={`expense-edit-form-${parsedId}`} />
		</FormPageLayout>
	);
}
