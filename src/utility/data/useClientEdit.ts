"use client";

import {
	type ClientEditType,
	type ClientType,
	type ResourceType,
	clientEditSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action: ActionType = "edit";
const inputZodSchema = clientEditSchema;

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
	editedData: ClientEditType,
) {
	return (oldData || []).map((c) =>
		c.id === editedData.id ? { ...c, ...editedData } : c,
	);
}
