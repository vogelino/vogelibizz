import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_resource/projects/create")({
	component: ProjectCreatePageRoute,
});

function ProjectCreatePageRoute() {
	return (
		<FormPageLayout
			title="Create Project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/projects">
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form="project-create-form">
						<SaveIcon />
						{"Create project"}
					</Button>
				</>
			}
		>
			<ProjectEdit formId="project-create-form" />
		</FormPageLayout>
	);
}
