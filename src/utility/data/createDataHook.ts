import type { ResourceType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ZodSchema, z } from "zod";
import { handleFetchResponse } from "../dataHookUtil";

const apiBaseUrl = env.client.NEXT_PUBLIC_BASE_URL;
export function createResourceQueryHook({
  resourceName,
  responseZodSchema,
  single = false,
}: {
  resourceName: ResourceType;
  responseZodSchema: ZodSchema;
  single?: boolean;
}) {
  async function queryFn(
    id?: number | string
  ): Promise<z.infer<typeof responseZodSchema>> {
    const apiUrl = [apiBaseUrl, "api", resourceName, id]
      .filter(Boolean)
      .join("/");
    return handleFetchResponse({
      response: await fetch(apiUrl),
      crudAction: "query",
      resourceName,
      zodSchema: id ? responseZodSchema : responseZodSchema.array(),
      data: id,
    });
  }

  return function hook(
    id: typeof single extends true ? number | string : undefined
  ): {
    data: z.infer<typeof responseZodSchema> | undefined;
    isPending: boolean;
    error: Error | null;
  } {
    const queryKey = [resourceName, id].filter(Boolean);
    return useSuspenseQuery({ queryKey, queryFn: () => queryFn(id) });
  };
}
