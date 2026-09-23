import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import {
	clientsQueryOptions,
	projectQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";
import { ProjectEditOverlay } from "../edit.$id.modal";

export const Route = createFileRoute("/_resource/projects/edit/$id")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		const [project, clients] = await Promise.all([
			context.queryClient.ensureQueryData(projectQueryOptions(parsedId)),
			context.queryClient.ensureQueryData(clientsQueryOptions()),
			context.queryClient.ensureQueryData(projectsQueryOptions()),
		]);
		return { project, clients };
	},
	component: ProjectEditPageRoute,
});

function ProjectEditPageRoute() {
	const childMatches = useChildMatches();
	const { id } = Route.useParams();
	const data = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<ProjectEditOverlay id={id} project={data.project} clients={data.clients} />
	);
}
