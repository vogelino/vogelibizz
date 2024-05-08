import ClientEdit from "@/components/ClientEdit";
import EditResourceModal from "@/components/EditResourceModal";
import db from "@/db";
import { clients } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export default async function ClientEditModalRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await db.query.clients.findFirst({
		where: eq(clients.id, +id),
	});
	await serverQueryClient.prefetchQuery({
		queryKey: ["project", id],
		queryFn: () => record,
	});
	if (!record) return null;
	return (
		<EditResourceModal
			id={`${id}`}
			title={record.name}
			formId={`client-edit-form-${id}`}
			resourceSingularName="client"
			crudAction="edit"
		>
			<ClientEdit id={`${id}`} formId={`client-edit-form-${id}`} />
		</EditResourceModal>
	);
}
