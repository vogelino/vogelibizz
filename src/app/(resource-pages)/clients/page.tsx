import db from "@/db";
import { QueryClient } from "@tanstack/react-query";
import ClientList from "./page.client";

export default function ClientsPageServer() {
	const queryClient = new QueryClient();
	queryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => db.query.clients.findMany(),
	});
	return <ClientList />;
}
