import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
	loader: ({ context, params }) => {
		const parsedId = parseId(params.id);
		void context.queryClient.prefetchQuery(clientQueryOptions(parsedId));
		void context.queryClient.prefetchQuery(projectsQueryOptions());
	},
	component: ClientEditModal,
});

function ClientEditModal() {
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
				<ClientEdit id={parsedId} formId={formId} />
			</ResponsiveModal>
		</>
	);
}
