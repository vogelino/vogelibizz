import ClientEdit from "@/components/ClientEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import db from "@/db";
import { clients } from "@/db/schema";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { SaveIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function ClientEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	const record = await db.query.clients.findFirst({
		where: eq(clients.id, +id),
	});
	await serverQueryClient.prefetchQuery({
		queryKey: ["clients", `${id}`],
		queryFn: () => record,
	});
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<FormPageLayout
				id={id}
				title={record?.name || "Edit client"}
				allLink="/clients"
				footerButtons={
					<>
						<Button asChild variant="outline">
							<Link href={`/clients/edit/${id}`}>
								<span>{"Cancel"}</span>
							</Link>
						</Button>
						<Button type="submit" form={`client-edit-form-${id}`}>
							<SaveIcon />
							{"Save client"}
						</Button>
					</>
				}
			>
				<ClientEdit id={id} formId={`client-edit-form-${id}`} />
			</FormPageLayout>
		</HydrationBoundary>
	);
}
