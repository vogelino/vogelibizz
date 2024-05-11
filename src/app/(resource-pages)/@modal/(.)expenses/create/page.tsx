import EditResourceModal from "@/components/EditResourceModal";
import ExpenseEdit from "@/components/ExpenseEdit";
import { singularizeResourceName } from "@/utility/resourceUtil";

const resource = "expenses";
const resourceSingularName = singularizeResourceName(resource);
const action = "create";
const formId = `${resource}-${action}-form`;

export const dynamic = "force-dynamic";
export default async function ExpenseCreateModalRoute() {
	return (
		<EditResourceModal
			formId={formId}
			resourceSingularName={resourceSingularName}
			crudAction={action}
		>
			<ExpenseEdit formId={formId} />
		</EditResourceModal>
	);
}
