import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/clients/edit/$id")({
	component: ClientEditPageRoute,
});

function ClientEditPageRoute() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const idString = `${id}`;
	const formId = `client-edit-form-${parsedId}`;

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to={`/clients/edit/${idString}`}>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={formId}>
						<SaveIcon />
						{"Save"}
					</Button>
				</>
			}
		>
			<ClientEdit id={parsedId} formId={formId} />
		</FormPageLayout>
	);
}
