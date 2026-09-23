import {
	createFileRoute,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { z } from "zod";
import {
	clientsQueryOptions,
	projectQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";
import { ProjectCreateOverlay } from "./create.modal";

export const Route = createFileRoute("/_resource/projects/create")({
	validateSearch: z.object({
		duplicateId: z.coerce.number().pipe(z.int().positive()).optional(),
	}),
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: async ({ context, deps }) => ({
		clients: await context.queryClient.ensureQueryData(clientsQueryOptions()),
		projects: await context.queryClient.ensureQueryData(projectsQueryOptions()),
		duplicate: deps.duplicateId
			? await context.queryClient.ensureQueryData(
					projectQueryOptions(deps.duplicateId),
				)
			: undefined,
	}),
	component: ProjectCreatePageRoute,
});

function ProjectCreatePageRoute() {
	const childMatches = useChildMatches();
	const { duplicate, clients } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return <ProjectCreateOverlay duplicate={duplicate} clients={clients} />;
}
