"use client";

import {
	type ClientInsertType,
	type ClientType,
	type ResourceType,
	clientInsertSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action: ActionType = "create";
const inputZodSchema = clientInsertSchema.array();

const useClientCreate = createMutationHook<ClientType[]>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void>({
		resourceName,
		action,
		inputZodSchema,
	}),
	createOptimisticDataEntry,
});

export default useClientCreate;

function createOptimisticDataEntry(
	oldData: ClientType[] | undefined,
	newData: ClientInsertType[],
) {
	return [
		...(oldData || []),
		...newData.map((client) => ({
			...client,
			id: (oldData?.at(-1)?.id ?? 99998) + 1,
			created_at: client.created_at || new Date().toISOString(),
			last_modified: new Date().toISOString(),
		})),
	];
}
