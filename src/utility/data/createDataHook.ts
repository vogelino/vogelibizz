import type { ResourceType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ZodSchema, z } from "zod";
import { handleFetchResponse } from "../dataHookUtil";

const apiBaseUrl = env.client.NEXT_PUBLIC_BASE_URL;
export function createResourceQueryHook<T extends ZodSchema>({
  resourceName,
  responseZodSchema,
  single,
}: {
  resourceName: ResourceType;
  responseZodSchema: T;
  single?: true | undefined;
}) {
  type SchemaType = typeof responseZodSchema;
  type ReturnType = SchemaType extends ZodSchema
    ? z.infer<SchemaType>
    : undefined;
  async function queryFn(id?: number | string): Promise<ReturnType> {
    const apiUrl = [apiBaseUrl, "api", resourceName, id]
      .filter(Boolean)
      .join("/");
    return handleFetchResponse({
      response: await fetch(apiUrl),
      crudAction: "query",
      resourceName,
      zodSchema: responseZodSchema,
      data: id,
    });
  }

  type HookArgsType<T> = T extends undefined ? [] : [id: number | string];
  return function hook(...args: HookArgsType<typeof single>): {
    data: ReturnType;
    isPending: boolean;
    error: Error | null;
  } {
    const id = single ? args[0] : undefined;
    const queryKey = [resourceName, id].filter(Boolean);
    return useSuspenseQuery({ queryKey, queryFn: () => queryFn(id) });
  };
}
