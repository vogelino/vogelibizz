import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
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
		if (import.meta.env.SSR) {
			const [client, projects] = await Promise.all([
				context.queryClient.ensureQueryData(clientQueryOptions(parsedId)),
				context.queryClient.ensureQueryData(projectsQueryOptions()),
			]);
			return { client, projects };
		}
		void context.queryClient.prefetchQuery(clientQueryOptions(parsedId));
		void context.queryClient.prefetchQuery(projectsQueryOptions());
		return {};
	},
	component: ClientEditPageRoute,
});

function ClientEditPageRoute() {
	const childMatches = useChildMatches();
	const { id } = Route.useParams();
	const { client, projects } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
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
			/>
		</FormPageLayout>
	);
}
