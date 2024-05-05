import EditResourceModal from "@/components/EditResourceModal";
import ProjectEdit from "@/components/ProjectEdit";
import db from "@/db";
import { type ProjectType, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

type ResourceType = ProjectType;
const resource = "project";
const action = "edit";

export default async function ProjectEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const formId = `${resource}-${action}-form-${id}`;
	const record = await db.query.projects.findFirst({
		where: eq(projects.id, +id),
	});
	if (!record) return null;
	return (
		<EditResourceModal
			id={`${id}`}
			title={record.name}
			formId={formId}
			resourceSingularName={resource}
			crudAction="edit"
		>
			<ProjectEdit id={`${id}`} formId={formId} initialData={record} />
		</EditResourceModal>
	);
}
