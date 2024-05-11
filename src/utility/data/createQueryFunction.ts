import type { ResourceType } from "@/db/schema";
import env from "@/env";
import { ZodError, type AnyZodObject, type ZodSchema } from "zod";
import { handleFetchResponse } from "../dataHookUtil";
import { parseId } from "../resourceUtil";

export type ActionType =
  | "querySingle"
  | "queryAll"
  | "create"
  | "edit"
  | "delete";
type CommonArgs<A extends ActionType> = {
  resourceName: ResourceType;
  action: A;
};
type QueryAllArgs = CommonArgs<"queryAll"> & { outputZodSchema: ZodSchema };
type QuerySingleArgs = CommonArgs<"querySingle"> & {
  outputZodSchema: ZodSchema;
  id: string | number;
};
type CreateArgs = CommonArgs<"create"> & {
  inputZodSchema: ZodSchema;
};
type DeleteArgs = CommonArgs<"delete">;
type EditArgs = CommonArgs<"edit"> & { inputZodSchema: AnyZodObject };

type CreateQueryFnArgs =
  | CreateArgs
  | EditArgs
  | QuerySingleArgs
  | QueryAllArgs
  | DeleteArgs;

const apiBaseUrl = env.client.NEXT_PUBLIC_BASE_URL;

export default function createQueryFunction<OutputType>(
  args: CreateQueryFnArgs
) {
  if (args.action === "queryAll") return createQueryAllFn<OutputType>(args);
  if (args.action === "querySingle")
    return createQuerySingleFn<OutputType>(args);
  if (args.action === "create") return createCreateFn<OutputType>(args);
  if (args.action === "edit") return createEditFn<OutputType>(args);
  if (args.action === "delete") return createDeleteFn<OutputType>(args);
  throw new Error("Unknown action");
}

function createQueryAllFn<OutputType>(
  args: QueryAllArgs
): () => Promise<OutputType> {
  const { resourceName, outputZodSchema } = args;
  return async function queryFn(): Promise<OutputType> {
    const apiUrl = `${apiBaseUrl}/api/${resourceName}`;
    return handleFetchResponse({
      response: await fetch(apiUrl),
      crudAction: "query",
      resourceName,
      zodSchema: outputZodSchema,
    });
  };
}

function createQuerySingleFn<OutputType>(
  args: QuerySingleArgs
): (id: unknown) => Promise<OutputType> {
  const { resourceName, outputZodSchema } = args;
  return async function queryFn(): Promise<OutputType> {
    const parsedId = parseId(args.id);
    const apiUrl = `${apiBaseUrl}/api/${resourceName}/${parsedId}`;
    return handleFetchResponse({
      response: await fetch(apiUrl),
      crudAction: "query",
      resourceName,
      zodSchema: outputZodSchema,
      data: parsedId,
    });
  };
}

function createCreateFn<OutputType>(
  args: CreateArgs
): (data: unknown) => Promise<OutputType> {
  const { resourceName, inputZodSchema } = args;
  return async function queryFn(data: unknown): Promise<OutputType> {
    const input = inputZodSchema.parse(data);
    const apiUrl = `${apiBaseUrl}/api/${resourceName}`;
    return handleFetchResponse({
      response: await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(input),
      }),
      crudAction: "create",
      resourceName,
      data: input,
    });
  };
}

function createEditFn<OutputType>(
  args: EditArgs
): (data: unknown) => Promise<OutputType> {
  const { resourceName, inputZodSchema } = args;
  return async function queryFn(data: unknown): Promise<OutputType> {
    try {
      const input = inputZodSchema.parse(data);
      const apiUrl = `${apiBaseUrl}/api/${resourceName}/${input.id}`;
      console.log(`Editing ${resourceName}`, input, apiUrl);
      console.log(`–––––––––––––––––––––––––––––––––––––––`);
      return handleFetchResponse({
        response: await fetch(apiUrl, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
        crudAction: "edit",
        resourceName,
        data: input,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(error.issues[0].message);
      }
      throw error;
    }
  };
}

function createDeleteFn<OutputType>(
  args: DeleteArgs
): (id: unknown) => Promise<OutputType> {
  const { resourceName } = args;
  return async function queryFn(id: unknown): Promise<OutputType> {
    console.log(`Deleting ${resourceName}`, id);
    const parsedId = parseId(id);
    const apiUrl = `${apiBaseUrl}/api/${resourceName}/${parsedId}`;
    return handleFetchResponse({
      response: await fetch(apiUrl, {
        method: "DELETE",
      }),
      crudAction: "delete",
      resourceName,
      data: parsedId,
    });
  };
}
