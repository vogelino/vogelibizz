import { type ClientType, clientSelectSchema } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createQueryFunction } from "./createDataHook";

type DataType = ClientType;
const resourceName = "clients";
const action = "querySingle";
const outputZodSchema = clientSelectSchema;

function useClient(id: DataType["id"]) {
	const queryKey = [resourceName, id];
	return useSuspenseQuery<DataType>({
		queryKey,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
			id,
		}),
	});
}

export default useClient;
