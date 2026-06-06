import { createFileRoute } from "@tanstack/react-router";
import ProjectList from "@/features/projects/ProjectsList";
import { projectsQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/projects/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(projectsQueryOptions()),
	component: ProjectList,
});
