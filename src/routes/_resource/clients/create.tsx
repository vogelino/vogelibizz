import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_resource/clients/create")({
	component: ClientCreatePageRoute,
});

function ClientCreatePageRoute() {
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
			<ClientEdit formId="client-create-form" />
		</FormPageLayout>
	);
}
