"use client";

import {
	type ClientInsertType,
	type ClientType,
	clientInsertSchema,
	type ResourceType,
} from "@/db/schema";
import { getNowInUTC } from "../timeUtil";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "clients";
const action = "create" satisfies ActionType;
const inputZodSchema = clientInsertSchema.array();

const useClientCreate = createMutationHook<ClientType[], ClientInsertType[]>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void, ClientInsertType[]>({
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
): ClientType[] {
	return [
		...(oldData || []),
		...newData.map((client) => ({
			...client,
			id: (oldData?.at(-1)?.id ?? 99998) + 1,
			taxId: client.taxId ?? "",
			name: client.name ?? "",
			legalName: client.legalName ?? "",
			addressLine1: client.addressLine1 ?? "",
			addressLine2: client.addressLine2 ?? "",
			addressLine3: client.addressLine3 ?? "",
			svgIconString: client.svgIconString ?? "",
			svgLogoString: client.svgLogoString ?? "",
			created_at: getNowInUTC(),
			last_modified: getNowInUTC(),
			projects: client.projects || [],
		})),
	];
}
