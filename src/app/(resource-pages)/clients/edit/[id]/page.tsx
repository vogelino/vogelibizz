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
export default function ClientEditPageRoute({
	params: { id },
}: {
	params: { id: string };
}) {
	serverQueryClient.prefetchQuery({
		queryKey: ["client", id],
		queryFn: () =>
			db.query.clients.findFirst({
				where: eq(clients.id, +id),
			}),
	});
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<FormPageLayout
				id={id}
				title="Edit Client"
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
				<ClientEdit id={id} />
			</FormPageLayout>
		</HydrationBoundary>
	);
}
