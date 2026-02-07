import { ZodError, type ZodSchema } from "zod";
import type { ResourceType } from "@/db/schema";
import env from "@/env";
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
type DataWithOptionalId = { id?: undefined | number | string };
type DataWithRequiredId = { id: number | string };
type DataCollection = Array<DataWithOptionalId>;
type CreateInput = DataWithOptionalId | DataCollection;

type QueryAllArgs<OutputType> = CommonArgs<"queryAll"> & {
	outputZodSchema: ZodSchema<OutputType>;
};
type QuerySingleArgs<OutputType> = CommonArgs<"querySingle"> & {
	outputZodSchema: ZodSchema<OutputType>;
	id: string | number;
};
type CreateArgs<InputType extends CreateInput> = CommonArgs<"create"> & {
	inputZodSchema: ZodSchema<InputType>;
};
type DeleteArgs = CommonArgs<"delete">;
type EditArgs<InputType extends DataWithRequiredId> = CommonArgs<"edit"> & {
	inputZodSchema: ZodSchema<InputType>;
};

type CreateQueryFnArgs<OutputType, InputType extends CreateInput> =
	| CreateArgs<InputType>
	| EditArgs<DataWithRequiredId>
	| QuerySingleArgs<OutputType>
	| QueryAllArgs<OutputType>
	| DeleteArgs;

const apiBaseUrl = env.client.VITE_PUBLIC_BASE_URL;

export default function createQueryFunction<OutputType>(
	args: QueryAllArgs<OutputType>,
): () => Promise<OutputType>;
export default function createQueryFunction<OutputType>(
	args: QuerySingleArgs<OutputType>,
): () => Promise<OutputType>;
export default function createQueryFunction<OutputType, InputType extends CreateInput>(
	args: CreateArgs<InputType>,
): (data: InputType) => Promise<OutputType>;
export default function createQueryFunction<OutputType, InputType extends DataWithRequiredId>(
	args: EditArgs<InputType>,
): (data: InputType) => Promise<OutputType>;
export default function createQueryFunction<OutputType>(
	args: DeleteArgs,
): (id: unknown) => Promise<OutputType>;
export default function createQueryFunction<OutputType, InputType extends CreateInput>(
	args: CreateQueryFnArgs<OutputType, InputType>,
) {
	if (args.action === "queryAll") return createQueryAllFn<OutputType>(args);
	if (args.action === "querySingle")
		return createQuerySingleFn<OutputType>(args);
	if (args.action === "create")
		return createCreateFn<OutputType, InputType>(args);
	if (args.action === "edit")
		return createEditFn<OutputType, DataWithRequiredId>(args);
	if (args.action === "delete") return createDeleteFn<OutputType>(args);
	throw new Error("Unknown action");
}

function createQueryAllFn<OutputType>(
	args: QueryAllArgs<OutputType>,
) {
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
	args: QuerySingleArgs<OutputType>,
) {
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

function createCreateFn<OutputType, InputType extends CreateInput>(
	args: CreateArgs<InputType>,
): (data: InputType) => Promise<OutputType> {
	const { resourceName, inputZodSchema } = args;
	return async function queryFn(data: InputType): Promise<OutputType> {
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

function createEditFn<OutputType, InputType extends DataWithRequiredId>(
	args: EditArgs<InputType>,
): (data: InputType) => Promise<OutputType> {
	const { resourceName, inputZodSchema } = args;
	return async function queryFn(data: InputType): Promise<OutputType> {
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
	args: DeleteArgs,
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
