"use client";

import {
	type ClientType,
	type ResourceType,
	clientInsertSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action: ActionType = "edit";
const inputZodSchema = clientInsertSchema;

const useClientEdit = createMutationHook<ClientType[]>({
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

export default useClientEdit;

function createOptimisticDataEntry(
	oldData: ClientType[] | undefined,
	editedData: ClientType,
) {
	return (oldData || []).filter((c) =>
		c.id === editedData.id ? { ...c, ...editedData } : c,
	);
}
