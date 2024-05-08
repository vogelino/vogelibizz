import type { ResourceType } from "@/db/schema";
import env from "@/env";
import { type ZodSchema, z } from "zod";
import { handleFetchResponse } from "../dataHookUtil";

type ActionType = "querySingle" | "queryAll" | "create" | "edit" | "delete";
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
	outputZodSchema: ZodSchema;
};
type DeleteArgs = CommonArgs<"delete">;
type EditArgs = CommonArgs<"edit"> & { inputZodSchema: ZodSchema };

type CreateQueryFnArgs =
	| CreateArgs
	| EditArgs
	| QuerySingleArgs
	| QueryAllArgs
	| DeleteArgs;

const apiBaseUrl = env.client.NEXT_PUBLIC_BASE_URL;

export function createQueryFunction<OutputType>(
	args: CreateQueryFnArgs,
): (...args: unknown[]) => Promise<OutputType> {
	if (args.action === "queryAll") return createQueryAllFn(args);
	if (args.action === "querySingle") return createQuerySingleFn(args);
	if (args.action === "create") return createCreateFn(args);
	if (args.action === "edit") return createEditFn(args);
	if (args.action === "delete") return createDeleteFn(args);
	throw new Error("Unknown action");
}

function createQueryAllFn<OutputType>(
	args: QueryAllArgs,
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
	args: QuerySingleArgs,
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
	args: CreateArgs,
): (data: unknown) => Promise<OutputType> {
	const { resourceName, inputZodSchema, outputZodSchema } = args;
	return async function queryFn(data: unknown): Promise<OutputType> {
		const input = inputZodSchema.parse(data);
		const apiUrl = `${apiBaseUrl}/api/${resourceName}/${input.id}`;
		return handleFetchResponse({
			response: await fetch(apiUrl, {
				method: "POST",
				body: JSON.stringify(input),
			}),
			crudAction: "create",
			resourceName,
			zodSchema: outputZodSchema,
			data: input,
		});
	};
}

function createEditFn<OutputType>(
	args: EditArgs,
): (data: unknown) => Promise<OutputType> {
	const { resourceName, inputZodSchema } = args;
	return async function queryFn(data: unknown): Promise<OutputType> {
		const input = inputZodSchema.parse(data);
		const apiUrl = `${apiBaseUrl}/api/${resourceName}/${input.id}`;
		return handleFetchResponse({
			response: await fetch(apiUrl, {
				method: "PATCH",
				body: JSON.stringify(data),
			}),
			crudAction: "edit",
			resourceName,
			data: input,
		});
	};
}

function createDeleteFn<OutputType>(
	args: DeleteArgs,
): (id: unknown) => Promise<OutputType> {
	const { resourceName } = args;
	return async function queryFn(id: unknown): Promise<OutputType> {
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

function parseId(id: unknown) {
	return z
		.union([z.string(), z.number()], {
			message: `The provided ID is not a valid number or string. Received "${id}"`,
		})
		.parse(id);
}
