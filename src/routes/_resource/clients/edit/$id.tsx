import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import {
	clientQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/clients/edit/$id")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		const [client, projects] = await Promise.all([
			context.queryClient.ensureQueryData(clientQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(projectsQueryOptions()),
		]);
		return { client, projects };
	},
	component: ClientEditPageRoute,
	pendingComponent: ClientEditPagePending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ClientEditPageRoute() {
	const { id } = Route.useParams();
	const { client, projects } = Route.useLoaderData();
	const isPending = useRouterState({ select: (state) => state.isLoading });
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `client-edit-form-${parsedId}`;

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/clients">
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
			<ClientEdit
				id={parsedId}
				formId={formId}
				initialData={client}
				initialProjects={projects}
				loading={isPending}
			/>
		</FormPageLayout>
	);
}

function ClientEditPagePending() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `client-edit-form-${parsedId}`;
	return (
		<FormPageLayout
			id={parsedId}
			title="Edit client"
			allLink="/clients"
			footerButtons={null}
		>
			<ClientEdit id={parsedId} formId={formId} loading />
		</FormPageLayout>
	);
}
