import { getClients } from "@/utility/data/useClients";
import { QueryClient } from "@tanstack/react-query";
import ClientList from "./page.client";

export default function ClientsPageServer() {
	const queryClient = new QueryClient();
	queryClient.prefetchQuery({
		queryKey: ["clients"],
		queryFn: () => getClients(),
	});
	return <ClientList />;
}
