import EditResourceModal from "@/components/EditResourceModal";
import ExpenseEdit from "@/components/ExpenseEdit";
import type { ExpenseType } from "@/db/schema";
import { supabaseClient } from "@/utility/supabase-client";

export default async function ExpenseEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await supabaseClient
		.from("expenses")
		.select("*")
		.eq("id", id)
		.single();
	const data = record.data as ExpenseType;
	return (
		<EditResourceModal
			id={`${id}`}
			title={data.name}
			formId={`expense-edit-form-${id}`}
			resourceSingularName="expense"
			crudAction="edit"
		>
			<ExpenseEdit
				id={`${id}`}
				formId={`expense-edit-form-${id}`}
				initialData={data}
			/>
		</EditResourceModal>
	);
}
