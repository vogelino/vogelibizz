import { type ClientType, clientSelectSchema } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import createQueryFunction from "./createQueryFunction";

type DataType = ClientType[];
const resourceName = "clients";
const action = "queryAll";
const outputZodSchema = clientSelectSchema.array();

function useClients() {
	const queryKey = [resourceName];
	return useSuspenseQuery<DataType>({
		queryKey,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
		}),
	});
}

export default useClients;
