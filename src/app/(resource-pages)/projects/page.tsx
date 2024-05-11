import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ProjectsList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ProjectsPageServer() {
	const projects = await db.query.projects.findMany();
	serverQueryClient.setQueryData(["projects"], projects);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ProjectsList />
		</HydrationBoundary>
	);
}
