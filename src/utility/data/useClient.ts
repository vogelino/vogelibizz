"use client";

import { clientSelectSchema, type ClientType } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import createQueryFunction from "./createQueryFunction";

type DataType = ClientType;
const resourceName = "clients";
const action = "querySingle";
const outputZodSchema = clientSelectSchema;

function useClient(id?: string | number) {
  if (!id)
    return {
      data: null,
      isPending: false,
      error: null,
    };
  const queryKey = [resourceName, `${id}`];
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
