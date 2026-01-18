import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getProjects } from "@/app/api/projects/getProjects";
import createServerQueryClient from "@/utility/data/serverQueryClient";
import ProjectsList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ProjectsPageServer() {
	const projects = await getProjects();
	const serverQueryClient = createServerQueryClient();
	serverQueryClient.setQueryData(["projects"], projects);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ProjectsList />
		</HydrationBoundary>
	);
}
