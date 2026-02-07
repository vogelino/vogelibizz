import { createFileRoute, Link } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { type ClientType, clientSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/clients/edit/$id")({
	loader: async ({ params }) => {
		const parsedId = parseId(params.id);
		if (typeof window === "undefined") {
			const { getClient } = await import("@/server/api/clients/getClient");
			const client = await getClient(parsedId);
			return { client };
		}
		const client = await createQueryFunction<ClientType>({
			resourceName: "clients",
			action: "querySingle",
			outputZodSchema: clientSelectSchema,
			id: parsedId,
		})();
		return { client };
	},
	component: ClientEditPageRoute,
});

function ClientEditPageRoute() {
	const { id } = Route.useParams();
	const { client } = Route.useLoaderData();
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
			<ClientEdit id={parsedId} formId={formId} initialData={client} />
		</FormPageLayout>
	);
}
