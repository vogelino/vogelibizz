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
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/clients/edit/$id/modal")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		await Promise.all([
			context.queryClient.prefetchQuery(clientQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(clientsQueryOptions()),
			context.queryClient.prefetchQuery(projectsQueryOptions()),
		]);
	},
	component: ClientEditModal,
});

function ClientEditModal() {
	const { id } = Route.useParams();
	return <ClientEditOverlay id={id} />;
}

export function ClientEditOverlay({
	id,
	client,
	projects,
}: {
	id: string;
	client?: Parameters<typeof ClientEdit>[0]["initialData"];
	projects?: Parameters<typeof ClientEdit>[0]["initialProjects"];
}) {
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
				/>
			</ResponsiveModal>
		</>
	);
}
