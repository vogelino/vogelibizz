"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClientType } from "@/db/schema";
import { clientsQueryOptions } from "@/utility/data/queryOptions";

function useClients({
	enabled = true,
	initialData,
}: {
	enabled?: boolean;
	initialData?: ClientType[];
} = {}) {
	return useQuery({
		...clientsQueryOptions(),
		enabled,
		...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
	});
}

export default useClients;
