import { getExpense } from "@/app/api/expenses/[id]/getExpense";
import EditResourceModal from "@/components/EditResourceModal";
import ExpenseEdit from "@/components/ExpenseEdit";
import serverQueryClient from "@/utility/data/serverQueryClient";

export const dynamic = "force-dynamic";
export default async function ExpenseEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await getExpense(+id);
	serverQueryClient.prefetchQuery({
		queryKey: ["project", id],
		queryFn: () => record,
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
			<ExpenseEdit id={`${id}`} formId={`expense-edit-form-${id}`} />
		</EditResourceModal>
	);
}
