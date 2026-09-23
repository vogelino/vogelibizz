import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import {
	clientQueryOptions,
	clientsQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";
import { ClientEditOverlay } from "../edit.$id.modal";

export const Route = createFileRoute("/_resource/clients/edit/$id")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		const [client, projects] = await Promise.all([
			context.queryClient.ensureQueryData(clientQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(projectsQueryOptions()),
			context.queryClient.ensureQueryData(clientsQueryOptions()),
		]);
		return { client, projects };
	},
	component: ClientEditPageRoute,
});

function ClientEditPageRoute() {
	const childMatches = useChildMatches();
	const { id } = Route.useParams();
	const data = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<ClientEditOverlay id={id} client={data.client} projects={data.projects} />
	);
}
