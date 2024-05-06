import EditResourceModal from "@/components/EditResourceModal";
import ExpenseEdit from "@/components/ExpenseEdit";

export const dynamic = "force-dynamic";
export default async function ExpenseCreateModalRoute() {
	return (
		<EditResourceModal
			formId={`expense-create-form`}
			resourceSingularName="expense"
			crudAction="create"
		>
			<ExpenseEdit formId={`expense-create-form`} />
		</EditResourceModal>
	);
}
