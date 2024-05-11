import { getExpense } from "@/app/api/expenses/[id]/getExpense";
import EditResourceModal from "@/components/EditResourceModal";
import ExpenseEdit from "@/components/ExpenseEdit";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId, singularizeResourceName } from "@/utility/resourceUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

const resource = "expenses";
const resourceSingularName = singularizeResourceName(resource);
const action = "edit";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

export const dynamic = "force-dynamic";
export default async function ExpenseEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const parsedId = parseId(id);
	const formId = `${resource}-${action}-form-${parsedId}`;
	const record = await getExpense(parsedId);
	serverQueryClient.setQueryData([resource, `${parsedId}`], record);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<EditResourceModal
				id={parsedId}
				title={record?.name || `${capitalizedAction} ${resourceSingularName}`}
				formId={formId}
				resourceSingularName={resourceSingularName}
				crudAction={action}
			>
				<ExpenseEdit id={parsedId} formId={formId} />
			</EditResourceModal>
		</HydrationBoundary>
	);
}
