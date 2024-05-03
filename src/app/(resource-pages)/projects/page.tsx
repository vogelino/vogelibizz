import { getProjects } from "@/utility/data/useProjects";
import { QueryClient } from "@tanstack/react-query";
import ProjectsList from "./page.client";

export default function ClientsPageServer() {
	const queryClient = new QueryClient();
	queryClient.prefetchQuery({
		queryKey: ["projects"],
		queryFn: () => getProjects(),
	});
	return <ProjectsList />;
}
