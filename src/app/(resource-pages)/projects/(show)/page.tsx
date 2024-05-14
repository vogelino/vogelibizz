import { getProjects } from "@/app/api/projects/getProjects";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ProjectsList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ProjectsPageServer() {
	const projects = await getProjects();
	serverQueryClient.setQueryData(["projects"], projects);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ProjectsList />
		</HydrationBoundary>
	);
}
