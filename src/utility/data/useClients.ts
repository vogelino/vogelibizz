"use client";

import { useQuery } from "@tanstack/react-query";
import { type ClientType, clientSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

function useClients({ enabled = true }: { enabled?: boolean } = {}) {
	const queryFn = createQueryFunction<ClientType[]>({
		resourceName: "clients",
		action: "queryAll",
		outputZodSchema: clientSelectSchema.array(),
	});
	return useQuery({
		...queryKeys.clients.list,
		queryFn,
		enabled,
	});
}

export default useClients;
