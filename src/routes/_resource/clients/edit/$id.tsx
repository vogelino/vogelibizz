import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
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
	pendingComponent: ClientEditPagePending,
	pendingMs: 0,
	pendingMinMs: 200,
});

function ClientEditPageRoute() {
	const { id } = Route.useParams();
	const { client } = Route.useLoaderData();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `client-edit-form-${parsedId}`;
	const isPending = useRouterState({ select: (state) => state.isLoading });

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit client"
			allLink="/clients"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/clients">
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
			<ClientEdit
				id={parsedId}
				formId={formId}
				initialData={client}
				loading={isPending}
			/>
		</FormPageLayout>
	);
}

function ClientEditPagePending() {
	const { id } = Route.useParams();
	const parsedId = parseId(id);
	if (!parsedId) return null;
	const formId = `client-edit-form-${parsedId}`;
	return (
		<FormPageLayout
			id={parsedId}
			title="Edit client"
			allLink="/clients"
			footerButtons={null}
		>
			<ClientEdit id={parsedId} formId={formId} loading />
		</FormPageLayout>
	);
}
