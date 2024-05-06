import { clientSelectSchema } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleFetchResponse } from "../dataHookUtil";

export const clientsQueryKey = ["clients"];
function useClients() {
	const { data, isPending, error } = useSuspenseQuery({
		queryKey: clientsQueryKey,
		queryFn: getClients,
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getClients() {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/clients`,
	);

	return handleFetchResponse({
		response,
		crudAction: "query",
		resourceName: "clients",
		zodSchema: clientSelectSchema.array(),
	});
}

export default useClients;
