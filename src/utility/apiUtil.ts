import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { parseId } from "@/utility/resourceUtil";
import type { ActionType } from "./data/createQueryFunction";

export type HandlerContext = {
	request: Request;
	params?: Record<string, string>;
};

export function json(data: unknown, init: ResponseInit = {}) {
	const headers = new Headers(init.headers);
	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}
	return new Response(JSON.stringify(data), {
		...init,
		headers,
	});
}

async function validateParams(
	paramsPromise: unknown,
	bodyFallback?: unknown,
): Promise<{ id: number; error: null } | { id?: undefined; error: string }> {
	const params = await paramsPromise;
	const idSchema = z.union([z.string(), z.number()]);
	const idTest = idSchema.safeParse(params);
	if (idTest.success) return { id: parseId(idTest.data), error: null };

	const objTest = z.object({ id: idSchema }).safeParse(params);
	if (!objTest.error) return { id: parseId(objTest.data.id), error: null };

	const bodyTest = z
		.object({ id: idSchema })
		.safeParse(bodyFallback ?? undefined);
	if (!bodyTest.error) return { id: parseId(bodyTest.data.id), error: null };

	const fallbackLabel = bodyFallback ? "request body" : "params object";
	console.log(`Missing ID in ${fallbackLabel}`, objTest.error);
	return { error: `Missing ID in ${fallbackLabel}` };
}

async function _validateBody<
	InputType extends { id: number | string },
	InputSchema extends z.ZodSchema<InputType>,
>(
	body: unknown,
	schema: InputSchema,
): Promise<
	{ body: InputType; error: null } | { body?: undefined; error: string }
> {
	const { id, error } = await validateParams(body);
	if (error || !id) return { error: error || "Missing ID in body" };
	const bodyIsObject = z.object({}).safeParse(body);
	if (bodyIsObject.error) {
		console.log(`Body is not an object`, bodyIsObject.error);
		return { error: "Body is not an object" };
	}
	const parsedBody = schema.safeParse({ ...bodyIsObject.data, id });
	if (parsedBody.error) {
		console.log(`Invalid body`, parsedBody.error.message);
		return { error: "Invalid body" };
	}
	return { body: parsedBody.data, error: null };
}

export async function handleNotFoundDbQuery<T>(data: T, notFoundMessage = "") {
	if (!data)
		return json(
			{ error: notFoundMessage || "Resource not found" },
			{ status: 404 },
		);
	return json(data);
}

export function getEditionRoute(
	mutateData: (inputId: number, body?: unknown) => Promise<unknown>,
) {
	return async ({ request, params = {} }: HandlerContext) => {
		const allowed = await ensureAdmin(request);
		if (allowed) return allowed;

		let body = {};
		try {
			body = await request.json();
			body = z.object({}).passthrough().parse(body);
		} catch (err) {
			return handleError(err, "edit");
		}
		const validation = await validateParams(params, body);
		if (validation.error || !validation.id)
			return json(
				{ error: validation.error },
				{ status: 400, statusText: "Invalid Parameters" },
			);
		const id = validation.id;
		try {
			console.log(`–––––––––––––––––––––––––`);
			console.log(`Mutating using the id and body`);
			console.log(`–––––––––––––––––––––––––`);
			await mutateData(id, body);
			return json({ success: true }, { status: 200 });
		} catch (err) {
			return handleError(err, "edit");
		}
	};
}

export function getDeletionRoute(mutateData: (id: number) => Promise<unknown>) {
	return async ({ request, params = {} }: HandlerContext) => {
		const allowed = await ensureAdmin(request);
		if (allowed) return allowed;

		const { id, error } = await validateParams(params);
		if (error || !id)
			return json(
				{ error },
				{ status: 400, statusText: error || "Missing ID in params" },
			);
		try {
			await mutateData(id);
			return json({ success: true }, { status: 200 });
		} catch (err) {
			return handleError(err, "delete");
		}
	};
}

export const getCreationRoute = (
	mutateData: (body: unknown) => Promise<unknown>,
) => {
	return async ({ request }: HandlerContext) => {
		const allowed = await ensureAdmin(request);
		if (allowed) return allowed;

		try {
			const bodyJson = await request.json();
			await mutateData(bodyJson);
			return json({ success: true }, { status: 200 });
		} catch (err) {
			return handleError(err, "create");
		}
	};
};

export function getQueryRouteWithId(
	getData: (id: number) => Promise<unknown>,
	getNotFoundMessage = (id: number | string) =>
		`Resource with id '${id}' does not exist`,
) {
	return async ({ request, params }: HandlerContext) => {
		const allowed = await ensureAdmin(request);
		if (allowed) return allowed;

		const validation = await validateParams(params);
		if (validation.error || !validation.id)
			return json({ error: validation.error || "Missing ID" }, { status: 400 });
		return handleNotFoundDbQuery(
			await getData(parseId(validation.id)),
			getNotFoundMessage(validation.id),
		);
	};
}

function handleError(err: unknown, action: ActionType) {
	console.log(`–––––––––––––––––––––––––`);
	console.log(`Error in the ${action} route`);
	if (err instanceof z.ZodError) {
		const joinedIssues = err.issues
			.map(({ message, path }) => `- ${path}: ${message}`)
			.join("\n");
		console.log(joinedIssues);
		console.log(`–––––––––––––––––––––––––`);
		return json(
			{ error: joinedIssues },
			{ status: 400, statusText: "Invalid body" },
		);
	}
	console.log(err);
	console.log(`–––––––––––––––––––––––––`);
	return json({ error: err }, { status: 500 });
}

async function ensureAdmin(request: Request) {
	const allowed = await isAuthenticatedAndAdmin(undefined, request);
	if (!allowed) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}
	return null;
}
