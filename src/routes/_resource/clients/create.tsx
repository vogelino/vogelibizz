import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { projectsQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/clients/create")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(projectsQueryOptions()),
	component: ClientCreatePageRoute,
});

function ClientCreatePageRoute() {
	const childMatches = useChildMatches();
	const projects = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	return (
		<FormPageLayout
			title="Create client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/clients">
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
			<ClientEdit formId="client-create-form" initialProjects={projects} />
		</FormPageLayout>
	);
}
