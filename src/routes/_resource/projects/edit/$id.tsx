import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
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
		const [project, clients] = await Promise.all([
			context.queryClient.ensureQueryData(projectQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(clientsQueryOptions()),
		]);
		return { project, clients };
	},
	component: ProjectEditPageRoute,
	pendingComponent: ProjectEditPagePending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ProjectEditPageRoute() {
	const { id } = Route.useParams();
	const { clients, project } = Route.useLoaderData();
	const isPending = useRouterState({ select: (state) => state.isLoading });
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
				loading={isPending}
			/>
		</FormPageLayout>
	);
}

function ProjectEditPagePending() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `project-edit-form-${parsedId}`;
	return (
		<FormPageLayout
			id={parsedId}
			title="Edit project"
			allLink="/projects"
			footerButtons={null}
		>
			<ProjectEdit id={parsedId} formId={formId} loading />
		</FormPageLayout>
	);
}
