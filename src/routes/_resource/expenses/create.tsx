import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_resource/expenses/create")({
	component: ExpenseCreatePageRoute,
});

function ExpenseCreatePageRoute() {
	const childMatches = useChildMatches();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<FormPageLayout
			title="Create Expense"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/expenses" search>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form="expense-create-form">
						<SaveIcon />
						{"Create expense"}
					</Button>
				</>
			}
		>
			<ExpenseEdit formId="expense-create-form" />
		</FormPageLayout>
	);
}
