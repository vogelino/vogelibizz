import { getClient } from "@/app/api/clients/[id]/getClient";
import ClientEdit from "@/components/ClientEdit";
import EditResourceModal from "@/components/EditResourceModal";
import type { ClientType } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId, singularizeResourceName } from "@/utility/resourceUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

const resource = "clients";
const resourceSingularName = singularizeResourceName(resource);
const action = "edit";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

export const dynamic = "force-dynamic";
export default async function ClientEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const parsedId = parseId(id);
	const formId = `${resource}-${action}-form-${parsedId}`;
	const record = await getClient(parsedId);
	serverQueryClient.setQueryData<ClientType>([resource, `${parsedId}`], record);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<EditResourceModal
				id={parsedId}
				title={record?.name || `${capitalizedAction} ${resourceSingularName}`}
				formId={formId}
				resourceSingularName={resourceSingularName}
				crudAction={action}
			>
				<ClientEdit id={parsedId} formId={formId} />
			</EditResourceModal>
		</HydrationBoundary>
	);
}
