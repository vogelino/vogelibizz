"use client";

import {
  type ClientInsertType,
  type ClientType,
  type ResourceType,
  clientInsertSchema,
} from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";
import { getNowInUTC } from "../timeUtil";

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
