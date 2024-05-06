import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import ProjectsList from "./page.client";

export const dynamic = "force-dynamic";
export default function ProjectsPageServer() {
	serverQueryClient.prefetchQuery({
		queryKey: ["projects"],
		queryFn: () => db.query.projects.findMany(),
	});
	return <ProjectsList />;
}
