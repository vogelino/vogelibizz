import EditResourceModal from "@/components/EditResourceModal";
import ProjectEdit from "@/components/ProjectEdit";
import db from "@/db";
import { projects, type ProjectType } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId, singularizeResourceName } from "@/utility/resourceUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

const resource = "projects";
const resourceSingularName = singularizeResourceName(resource);
const action = "edit";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

export const dynamic = "force-dynamic";
export default async function ProjectEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const parsedId = parseId(id);
	const formId = `${resource}-${action}-form-${parsedId}`;
	const record = await db.query.projects.findFirst({
		where: eq(projects.id, parsedId),
	});
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
