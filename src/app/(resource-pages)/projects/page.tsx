import db from "@/db";
import { QueryClient } from "@tanstack/react-query";
import ProjectsList from "./page.client";

export default function ProjectsPageServer() {
	const queryClient = new QueryClient();
	queryClient.prefetchQuery({
		queryKey: ["projects"],
		queryFn: () => db.query.projects.findMany(),
	});
	return <ProjectsList />;
}
