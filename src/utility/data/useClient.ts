"use client";

import { useQuery } from "@tanstack/react-query";
import { type ClientType, clientSelectSchema } from "@/db/schema";
import createQueryFunction from "./createQueryFunction";

type DataType = ClientType;
const resourceName = "clients";
const action = "querySingle";
const outputZodSchema = clientSelectSchema;

function useClient(id?: string | number, initialData?: DataType) {
	const queryKey = [resourceName, `${id ?? ""}`];
	return useQuery<DataType>({
		queryKey,
		enabled: Boolean(id),
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
			id: id ?? "",
		}),
		initialData,
		initialDataUpdatedAt: initialData ? Date.now() : undefined,
	});
}

export default useClient;
