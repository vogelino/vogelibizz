import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ProjectList from "@/features/projects/ProjectsList";
import {
	clientsQueryOptions,
	projectQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/projects/edit/$id/modal")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		const [project, clients] = await Promise.all([
			context.queryClient.ensureQueryData(projectQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(clientsQueryOptions()),
		]);
		return { project, clients };
	},
	component: ProjectEditModal,
	pendingComponent: ProjectEditModalPending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ProjectEditModal() {
	const { id } = Route.useParams();
	const { clients, project } = Route.useLoaderData();
	const navigate = useNavigate();
	const isPending = useRouterState({ select: (state) => state.isLoading });
	const parsedId = parseId(id);
	if (!parsedId) return <ProjectList />;
	const formId = `project-edit-form-${parsedId}`;

	return (
		<>
			<ProjectList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit project" id={parsedId} />}
				onClose={() => navigate({ to: "/projects" })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/projects" })}
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
					loading={isPending}
				/>
			</ResponsiveModal>
		</>
	);
}

function ProjectEditModalPending() {
	const { id } = Route.useParams();
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
				onClose={() => navigate({ to: "/projects" })}
				footer={null}
			>
				<ProjectEdit id={parsedId} formId={formId} loading />
			</ResponsiveModal>
		</>
	);
}
