"use client";

import { z } from "zod";
import type { ClientType, ResourceType } from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action: ActionType = "delete";
const inputZodSchema = z.number();

const useClientDelete = createMutationHook<ClientType[], ClientType["id"]>({
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
): ClientType[] {
	return (oldData || []).filter((c) => c.id !== deletedId);
}
