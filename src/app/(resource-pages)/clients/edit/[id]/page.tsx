import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { getClient } from "@/app/api/clients/[id]/getClient";
import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId, singularizeResourceName } from "@/utility/resourceUtil";

const resource = "clients";
const resourceSingular = singularizeResourceName(resource);
const action = "edit";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

export const dynamic = "force-dynamic";
export default async function ClientEditPageRoute({
	params,
}: {
	params: Promise<{ id?: string }>;
}) {
	const { id } = await params;
	if (!id) {
		return null;
	}

	const parsedId = parseId(id);
	if (!parsedId) {
		return null;
	}

	const formId = `${resource}-${action}-form-${parsedId}`;
	const record = await getClient(parsedId);
	serverQueryClient.setQueryData([resource, `${parsedId}`], record);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<FormPageLayout
				id={parsedId}
				title={record?.name || `${capitalizedAction} ${resourceSingular}`}
				allLink={`/${resource}`}
				footerButtons={
					<>
						<Button asChild variant="outline">
							<Link href={`/${resource}/${action}/${parsedId}`}>
								<span>{"Cancel"}</span>
							</Link>
						</Button>
						<Button type="submit" form={formId}>
							<SaveIcon />
							Save {resourceSingular}
						</Button>
					</>
				}
			>
				<ClientEdit id={parsedId} formId={formId} />
			</FormPageLayout>
		</HydrationBoundary>
	);
}
