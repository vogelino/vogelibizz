import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import ProjectsList from "./page.client";

export default function ProjectsPageServer() {
	serverQueryClient.prefetchQuery({
		queryKey: ["projects"],
		queryFn: () => db.query.projects.findMany(),
	});
	return <ProjectsList />;
}
