import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import db from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SaveIcon } from "lucide-react";
import { Link } from "next-view-transitions";

export default async function ExpenseEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await db.query.expenses.findFirst({
		where: eq(expenses.id, +id),
	});
	if (!record) return null;
	return (
		<FormPageLayout
			id={id}
			title={record.name || "Edit expense"}
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link href={`/expenses`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`expense-edit-form-${id}`}>
						<SaveIcon />
						{"Save expense"}
					</Button>
				</>
			}
		>
			<ExpenseEdit
				id={id}
				formId={`expense-edit-form-${id}`}
				initialData={record}
			/>
		</FormPageLayout>
	);
}
