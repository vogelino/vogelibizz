import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/projects/edit/$id")({
	component: ProjectEditPageRoute,
});

function ProjectEditPageRoute() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const idString = `${id}`;
	const formId = `project-edit-form-${parsedId}`;

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to={`/projects/edit/${idString}`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						{"Save"}
					</Button>
				</>
			}
		>
			<ProjectEdit id={parsedId} formId={formId} />
		</FormPageLayout>
	);
}
