import { createFileRoute } from "@tanstack/react-router";
import ClientList from "@/features/clients/ClientsList";
import { clientsQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource/clients/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(clientsQueryOptions()),
	component: ClientList,
});
