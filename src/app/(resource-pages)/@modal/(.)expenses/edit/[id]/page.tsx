import EditResourceModal from "@/components/EditResourceModal";
import ExpenseEdit from "@/components/ExpenseEdit";
import db from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ExpenseEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await db.query.expenses.findFirst({
		where: eq(expenses.id, +id),
	});
	if (!record) return null;
	return (
		<EditResourceModal
			id={`${id}`}
			title={record.name}
			formId={`expense-edit-form-${id}`}
			resourceSingularName="expense"
			crudAction="edit"
		>
			<ExpenseEdit
				id={`${id}`}
				formId={`expense-edit-form-${id}`}
				initialData={record}
			/>
		</EditResourceModal>
	);
}
