import db from "@/db";
import serverQueryClient from "@/utility/data/serverQueryClient";
import ClientList from "./page.client";

export const dynamic = "force-dynamic";
export default function ClientsPageServer() {
	serverQueryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => db.query.clients.findMany(),
	});
	return <ClientList />;
}
