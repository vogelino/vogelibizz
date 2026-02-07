"use client";

import { useQuery } from "@tanstack/react-query";
import { type ClientType, clientSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

type DataType = ClientType;

function useClient(id?: string | number, initialData?: DataType) {
	const query =
		id === undefined
			? queryKeys.clients.detail("")
			: queryKeys.clients.detail(id);
	const queryFn = createQueryFunction<ClientType>({
		resourceName: "clients",
		action: "querySingle",
		outputZodSchema: clientSelectSchema,
		id: id ?? "",
	});
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};
	return useQuery({
		...query,
		queryFn,
		enabled: Boolean(id),
		...initialDataOptions,
	});
}

export default useClient;
