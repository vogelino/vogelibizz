"use client";

import {
	type ClientEditType,
	type ClientType,
	clientEditSchema,
	type ResourceType,
} from "@/db/schema";
import { getNowInUTC } from "../timeUtil";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action = "edit" satisfies ActionType;
const inputZodSchema = clientEditSchema;

const useClientEdit = createMutationHook<ClientType[], ClientEditType>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void, ClientEditType>({
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
): ClientType[] {
	return (oldData || []).map((c) =>
		c.id === editedData.id
			? { ...c, ...editedData, last_modified: getNowInUTC() }
			: c,
	);
}
