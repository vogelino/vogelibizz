import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ClientList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ClientsPageServer() {
	const clients = await db.query.clients.findMany();
	serverQueryClient.setQueryData(["clients"], clients);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ClientList />
		</HydrationBoundary>
	);
}
