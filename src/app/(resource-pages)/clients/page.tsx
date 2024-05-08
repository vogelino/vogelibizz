import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ClientList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ClientsPageServer() {
	await serverQueryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => db.query.clients.findMany(),
	});
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ClientList />
		</HydrationBoundary>
	);
}
