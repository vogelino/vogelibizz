import type { ClientType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";

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

	if (!response.ok) {
		throw new Error(
			`Failed to fetch client ${id}: ${response.status} -> ${response.statusText}`,
		);
	}

	try {
		const json = await response.json();
		return json as ClientType;
	} catch (err) {
		throw new Error(`Failed to parse client ${id}'s json response: ${err}`);
	}
}

export default useClient;
