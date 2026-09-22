import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import { z } from "zod";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import {
	clientQueryOptions,
	projectsQueryOptions,
} from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/clients/create")({
	validateSearch: z.object({
		duplicateId: z.coerce.number().pipe(z.int().positive()).optional(),
	}),
	loaderDeps: ({ search }) => ({ duplicateId: search.duplicateId }),
	loader: async ({ context, deps }) => ({
		projects: await context.queryClient.ensureQueryData(projectsQueryOptions()),
		duplicate: deps.duplicateId
			? await context.queryClient.ensureQueryData(
					clientQueryOptions(deps.duplicateId),
				)
			: undefined,
	}),
	component: ClientCreatePageRoute,
});

function ClientCreatePageRoute() {
	const childMatches = useChildMatches();
	const { duplicate, projects } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<FormPageLayout
			title="Create client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/clients" search>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form="client-create-form">
						<SaveIcon />
						{"Create client"}
					</Button>
				</>
			}
		>
			<ClientEdit
				formId="client-create-form"
				initialData={
					duplicate
						? { ...duplicate, name: `copy ${duplicate.name}` }
						: undefined
				}
				initialProjects={projects}
			/>
		</FormPageLayout>
	);
}
