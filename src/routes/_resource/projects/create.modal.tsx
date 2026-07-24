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
} from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/projects/create/modal")({
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: async ({ context, deps }) => ({
		clients: await context.queryClient.ensureQueryData(clientsQueryOptions()),
		duplicate: deps.duplicateId
			? await context.queryClient.ensureQueryData(
					projectQueryOptions(deps.duplicateId),
				)
			: undefined,
	}),
	component: ProjectCreateModal,
});

function ProjectCreateModal() {
	const { clients, duplicate } = Route.useLoaderData();
	const navigate = useNavigate();
	const formId = "project-create-form";

	return (
		<>
			<ProjectList />
			<ResponsiveModal
				open
				title={
					<PageHeaderTitle
						name={duplicate ? "Duplicate project" : "Create project"}
					/>
				}
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
							{"Create project"}
						</Button>
					</>
				}
			>
				<ProjectEdit
					formId={formId}
					initialData={
						duplicate
							? { ...duplicate, name: `copy ${duplicate.name}` }
							: undefined
					}
					initialClients={clients}
				/>
			</ResponsiveModal>
		</>
	);
}
