import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getProject } from "@/app/api/projects/[id]/getProject";
import EditResourceModal from "@/components/EditResourceModal";
import ProjectEdit from "@/components/ProjectEdit";
import type { ProjectType } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId, singularizeResourceName } from "@/utility/resourceUtil";

const resource = "projects";
const resourceSingularName = singularizeResourceName(resource);
const action = "edit";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

export const dynamic = "force-dynamic";
export default async function ProjectEditModalRoute({
	params,
}: {
	params: Promise<{ id?: string }>;
}) {
	const { id } = await params;
	if (!id) {
		return null;
	}

	const parsedId = parseId(id);
	if (!parsedId) {
		return null;
	}
	const formId = `${resource}-${action}-form-${parsedId}`;
	const record = await getProject(parsedId);
	serverQueryClient.setQueryData<ProjectType>(
		[resource, `${parsedId}`],
		record,
	);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<EditResourceModal
				id={parsedId}
				title={record?.name || `${capitalizedAction} ${resourceSingularName}`}
				formId={formId}
				resourceSingularName={resourceSingularName}
				crudAction={action}
			>
				<ProjectEdit id={parsedId} formId={formId} />
			</EditResourceModal>
		</HydrationBoundary>
	);
}
