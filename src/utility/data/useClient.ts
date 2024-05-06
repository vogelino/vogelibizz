import { clientSelectSchema } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleFetchResponse } from "../dataHookUtil";

function useClient(id: number | undefined) {
	const queryKey = ["clients", id];
	const { data, isPending, error } = useSuspenseQuery({
		queryKey,
		queryFn: () => getClient(id),
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getClient(id: number | undefined) {
	if (!id) return null;
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/clients/${id}`,
	);
	return handleFetchResponse({
		response,
		data: id,
		crudAction: "query",
		resourceName: "clients",
		zodSchema: clientSelectSchema,
	});
}

export default useClient;
