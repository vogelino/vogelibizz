"use client";

import type { ClientType, ResourceType } from "@/db/schema";
import { z } from "zod";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action: ActionType = "delete";
const inputZodSchema = z.union([z.string(), z.number()]);

const useClientDelete = createMutationHook<ClientType[]>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void>({
		resourceName,
		action,
	}),
	createOptimisticDataEntry,
});

export default useClientDelete;

function createOptimisticDataEntry(
	oldData: ClientType[] | undefined,
	deletedId: ClientType["id"],
) {
	return (oldData || []).filter((c) => c.id !== deletedId);
}
