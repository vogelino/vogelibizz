import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { clientsQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/projects/create")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(clientsQueryOptions()),
	component: ProjectCreatePageRoute,
});

function ProjectCreatePageRoute() {
	const clients = Route.useLoaderData();
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
			<ProjectEdit formId="project-create-form" initialClients={clients} />
		</FormPageLayout>
	);
}
