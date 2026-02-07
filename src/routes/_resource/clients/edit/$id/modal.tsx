import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientList from "@/features/clients/ClientsList";
import ClientEdit from "@/components/ClientEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { type ClientType, clientSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/clients/edit/$id/modal")({
	loader: async ({ params }) => {
		const parsedId = parseId(params.id);
		if (typeof window === "undefined") {
			const { getClient } = await import("@/server/api/clients/getClient");
			const client = await getClient(parsedId);
			return { client };
		}
		const client = await createQueryFunction<ClientType>({
			resourceName: "clients",
			action: "querySingle",
			outputZodSchema: clientSelectSchema,
			id: parsedId,
		})();
		return { client };
	},
	component: ClientEditModal,
	pendingComponent: ClientEditModalPending,
});

function ClientEditModal() {
	const { id } = Route.useParams();
	const { client } = Route.useLoaderData();
	const navigate = useNavigate();
	const parsedId = parseId(id);
	if (!parsedId) return <ClientList />;
	const formId = `client-edit-form-${parsedId}`;
	const isPending = useRouterState({ select: (state) => state.isLoading });

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
