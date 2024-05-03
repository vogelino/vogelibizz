import EditResourceModal from "@/components/EditResourceModal";
import ProjectEdit from "@/components/ProjectEdit";
import type { ProjectType } from "@/db/schema";
import { supabaseClient } from "@/utility/supabase-client";

type ResourceType = ProjectType;
const resource = "project";
const action = "edit";

export default async function ProjectEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const formId = `${resource}-${action}-form-${id}`;
	const record = await supabaseClient
		.from(`${resource}s`)
		.select("*")
		.eq("id", id)
		.single();
	const data = record.data as ResourceType;
	return (
		<EditResourceModal
			id={`${id}`}
			title={data.name}
			formId={formId}
			resourceSingularName={resource}
			crudAction="edit"
		>
			<ProjectEdit id={`${id}`} formId={formId} initialData={data} />
		</EditResourceModal>
	);
}
