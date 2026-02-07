import { Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";

export default async function ExpenseCreatePageRoute() {
	return (
		<FormPageLayout
			title="Create Expense"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to={`/expenses`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`expense-create-form`}>
						<SaveIcon />
						{"Create expense"}
					</Button>
				</>
			}
		>
			<ExpenseEdit formId={`expense-create-form`} />
		</FormPageLayout>
	);
}
