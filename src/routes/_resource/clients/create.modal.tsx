import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ClientList from "@/features/clients/ClientsList";
import {
	clientQueryOptions,
	clientsQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/clients/create/modal")({
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: async ({ context, deps }) => ({
		clients: await context.queryClient.ensureQueryData(clientsQueryOptions()),
		projects: await context.queryClient.ensureQueryData(projectsQueryOptions()),
		duplicate: deps.duplicateId
			? await context.queryClient.ensureQueryData(
					clientQueryOptions(deps.duplicateId),
				)
			: undefined,
	}),
	component: ClientCreateModal,
});

function ClientCreateModal() {
	const { duplicate, projects } = Route.useLoaderData();
	return <ClientCreateOverlay duplicate={duplicate} projects={projects} />;
}

export function ClientCreateOverlay({
	duplicate,
	projects,
}: {
	duplicate: ReturnType<typeof Route.useLoaderData>["duplicate"];
	projects: ReturnType<typeof Route.useLoaderData>["projects"];
}) {
	const navigate = useNavigate();
	const formId = "client-create-form";

	return (
		<>
			<ClientList />
			<ResponsiveModal
				open
				title={
					<PageHeaderTitle
						name={duplicate ? "Duplicate client" : "Create client"}
					/>
				}
				onClose={() => navigate({ to: "/clients", search: true })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/clients", search: true })}
							>
								Cancel
							</button>
						</Button>
						<Button type="submit" form={formId}>
							<SaveIcon />
							{"Create client"}
						</Button>
					</>
				}
			>
				<ClientEdit
					formId={formId}
					initialData={
						duplicate
							? { ...duplicate, name: `copy ${duplicate.name}` }
							: undefined
					}
					initialProjects={projects}
				/>
			</ResponsiveModal>
		</>
	);
}
