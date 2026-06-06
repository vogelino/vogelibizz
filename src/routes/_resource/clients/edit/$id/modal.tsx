import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ClientList from "@/features/clients/ClientsList";
import {
	clientQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/clients/edit/$id/modal")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		const [client, projects] = await Promise.all([
			context.queryClient.ensureQueryData(clientQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(projectsQueryOptions()),
		]);
		return { client, projects };
	},
	component: ClientEditModal,
	pendingComponent: ClientEditModalPending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ClientEditModal() {
	const { id } = Route.useParams();
	const { client, projects } = Route.useLoaderData();
	const navigate = useNavigate();
	const isPending = useRouterState({ select: (state) => state.isLoading });
	const parsedId = parseId(id);
	if (!parsedId) return <ClientList />;
	const formId = `client-edit-form-${parsedId}`;

	return (
		<>
			<ClientList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit client" id={parsedId} />}
				onClose={() => navigate({ to: "/clients" })}
				footer={
					<>
						<Button asChild variant="outline">
							<button
								type="button"
								onClick={() => navigate({ to: "/clients" })}
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
				<ClientEdit
					id={parsedId}
					formId={formId}
					initialData={client}
					initialProjects={projects}
					loading={isPending}
				/>
			</ResponsiveModal>
		</>
	);
}

function ClientEditModalPending() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const parsedId = parseId(id);
	if (!parsedId) return <ClientList />;
	const formId = `client-edit-form-${parsedId}`;

	return (
		<>
			<ClientList />
			<ResponsiveModal
				open
				title={<PageHeaderTitle name="Edit client" id={parsedId} />}
				onClose={() => navigate({ to: "/clients" })}
				footer={null}
			>
				<ClientEdit id={parsedId} formId={formId} loading />
			</ResponsiveModal>
		</>
	);
}
