import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ProjectList from "@/features/projects/ProjectsList";
import {
	clientsQueryOptions,
	projectQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/projects/edit/$id/modal")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		await Promise.all([
			context.queryClient.prefetchQuery(projectQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(projectsQueryOptions()),
			context.queryClient.prefetchQuery(clientsQueryOptions()),
		]);
	},
	component: ProjectEditModal,
});

function ProjectEditModal() {
	const { id } = Route.useParams();
	return <ProjectEditOverlay id={id} />;
}

export function ProjectEditOverlay({
	id,
	project,
	clients,
}: {
	id: string;
	project?: Parameters<typeof ProjectEdit>[0]["initialData"];
	clients?: Parameters<typeof ProjectEdit>[0]["initialClients"];
}) {
	const navigate = useNavigate();
	const parsedId = parseId(id);
	if (!parsedId) return <ProjectList />;
	const formId = `project-edit-form-${parsedId}`;

	return (
		<>
			<ProjectList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit project" id={parsedId} />}
				onClose={() => navigate({ to: "/projects", search: true })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/projects", search: true })}
							>
								Cancel
							</button>
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
			</ResponsiveModal>
		</>
	);
}
