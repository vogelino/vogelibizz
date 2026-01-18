import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getClients } from "@/app/api/clients/getClients";
import serverQueryClient from "@/utility/data/serverQueryClient";
import ClientList from "./page.client";

export const dynamic = "force-dynamic";
export default async function ClientsPageServer() {
	const clients = await getClients();
	serverQueryClient.setQueryData(["clients"], clients);
	return (
		<HydrationBoundary state={dehydrate(serverQueryClient)}>
			<ClientList />
		</HydrationBoundary>
	);
}
