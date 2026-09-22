import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import { z } from "zod";
import FormPageLayout from "@/components/FormPageLayout";
import ProjectEdit from "@/components/ProjectEdit";
import { Button } from "@/components/ui/button";
import {
	clientsQueryOptions,
	projectQueryOptions,
} from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/projects/create")({
	validateSearch: z.object({
		duplicateId: z.coerce.number().pipe(z.int().positive()).optional(),
	}),
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: async ({ context, deps }) => ({
		clients: await context.queryClient.ensureQueryData(clientsQueryOptions()),
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
	const { clients, duplicate } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<FormPageLayout
			title="Create Project"
			allLink="/projects"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/projects" search>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form="project-create-form">
						<SaveIcon />
						{"Create project"}
					</Button>
				</>
			}
		>
			<ProjectEdit
				formId="project-create-form"
				initialData={
					duplicate
						? { ...duplicate, name: `copy ${duplicate.name}` }
						: undefined
				}
				initialClients={clients}
			/>
		</FormPageLayout>
	);
}
