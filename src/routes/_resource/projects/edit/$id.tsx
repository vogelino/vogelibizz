import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import {
	clientsQueryOptions,
	projectQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/projects/edit/$id")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		if (import.meta.env.SSR) {
			const [project, clients] = await Promise.all([
				context.queryClient.ensureQueryData(projectQueryOptions(parsedId)),
				context.queryClient.ensureQueryData(clientsQueryOptions()),
			]);
			return { project, clients };
		}
		void context.queryClient.prefetchQuery(projectQueryOptions(parsedId));
		void context.queryClient.prefetchQuery(clientsQueryOptions());
		return {};
	},
	component: ProjectEditPageRoute,
});

function ProjectEditPageRoute() {
	const childMatches = useChildMatches();
	const { id } = Route.useParams();
	const { project, clients } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `project-edit-form-${parsedId}`;

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/projects">
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
			<ProjectEdit
				id={parsedId}
				formId={formId}
				initialData={project}
				initialClients={clients}
			/>
		</FormPageLayout>
	);
}
