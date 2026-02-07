"use client";

import { useQuery } from "@tanstack/react-query";
import { type ClientType, clientSelectSchema } from "@/db/schema";
import createQueryFunction from "./createQueryFunction";

type DataType = ClientType[];
const resourceName = "clients";
const action = "queryAll";
const outputZodSchema = clientSelectSchema.array();

function useClients({ enabled = true }: { enabled?: boolean } = {}) {
	const queryKey = [resourceName];
	return useQuery<DataType>({
		queryKey,
		enabled,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
		}),
	});
}

export default useClients;
