import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import db from "@/db";
import { clients } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { parseId, singularizeResourceName } from "@/utility/resourceUtil";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { SaveIcon } from "lucide-react";
import Link from "next/link";

const resource = "clients";
const resourceSingular = singularizeResourceName(resource);
const action = "edit";
const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

export const dynamic = "force-dynamic";
export default async function ClientEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const parsedId = parseId(id);
	const formId = `${resource}-${action}-form-${parsedId}`;
	const record = await db.query.clients.findFirst({
		where: eq(clients.id, parsedId),
	});
	serverQueryClient.setQueryData([resource, `${parseId}`], record);
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
