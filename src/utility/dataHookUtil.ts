import { ZodError, type ZodSchema } from "zod";
import type { ResourceType } from "@/db/schema";
import env from "@/env";

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	return fetch(input, {
		credentials: "include",
		...init,
		headers,
	});
}

export async function apiGetJson<OutputType>(input: RequestInfo | URL) {
	const response = await apiFetch(input);
	if (!response.ok) throw new Error(`Request failed: ${response.status}`);
	return response.json() as Promise<OutputType>;
}

export function apiPostForm(
	input: RequestInfo | URL,
	body: Record<string, string>,
	init: RequestInit = {},
) {
	const headers = new Headers(init.headers);
	headers.set("Content-Type", "application/x-www-form-urlencoded");
	return apiFetch(input, {
		...init,
		method: "POST",
		headers,
		body: new URLSearchParams(body),
	});
}

export async function handleFetchResponse<OutputType>({
	response,
	data,
	crudAction,
	resourceName,
	zodSchema,
}: {
	response: Response;
	data?:
		| undefined
		| { id?: undefined | number | string }
		| Array<{ id?: undefined | number | string }>
		| number
		| string;
	crudAction: "create" | "edit" | "delete" | "query";
	resourceName: ResourceType;
	zodSchema?: ZodSchema<OutputType>;
}): Promise<OutputType> {
	let id: number | string | undefined;
	if (typeof data === "number" || typeof data === "string") {
		id = data;
	} else if (data && typeof data === "object") {
		if (Array.isArray(data)) {
			id = data.at(0)?.id;
		} else {
			id = data.id;
		}
	}

	const withIdText = id ? ` with id "${id}"` : "";
	if (!response.ok) {
		throw new Error(
			`Failed to ${crudAction} ${resourceName} item${withIdText}: ${response.status} -> ${response.statusText}`,
		);
	}

	const json = await response.json();
	if (json.error === "Unauthorized") {
		if (typeof window !== "undefined") {
			window.location.assign(`${env.client.VITE_PUBLIC_BASE_URL}/login`);
			return json;
		}
		throw new Error("Unauthorized");
	}
	if (json.error) throw json.error;

	if (!zodSchema) return json;
	try {
		return zodSchema.parse(json);
	} catch (err) {
		if (err instanceof ZodError) {
			const { path, message } = err.issues[0];
			throw new Error(
				`Error validating ${resourceName} item${withIdText}: ${path} -> ${message}`,
			);
		}
		throw new Error(`Invalid ${resourceName} item${withIdText}`);
	}
}
