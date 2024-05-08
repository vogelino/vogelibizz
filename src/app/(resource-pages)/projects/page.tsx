import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ProjectsList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ProjectsPageServer() {
	await serverQueryClient.prefetchQuery({
		queryKey: ["projects"],
		queryFn: () => db.query.projects.findMany(),
	});
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ProjectsList />
		</HydrationBoundary>
	);
}
