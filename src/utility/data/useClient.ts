"use client";

import { useQuery } from "@tanstack/react-query";
import type { ClientType } from "@/db/schema";
import { clientQueryOptions } from "@/utility/data/queryOptions";

type DataType = ClientType;

function useClient(id?: string | number, initialData?: DataType) {
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};
	return useQuery({
		...clientQueryOptions(id ?? ""),
		enabled: Boolean(id),
		...initialDataOptions,
	});
}

export default useClient;
