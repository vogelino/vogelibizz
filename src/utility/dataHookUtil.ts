import { redirect } from "next/navigation";
import { ZodError, type ZodSchema } from "zod";
import type { ResourceType } from "@/db/schema";
import env from "@/env";

export async function handleFetchResponse<
	T extends { id?: undefined | number | string },
>({
	response,
	data,
	crudAction,
	resourceName,
	zodSchema,
}: {
	response: Response;
	data?: undefined | T | number | string;
	crudAction: "create" | "edit" | "delete" | "query";
	resourceName: ResourceType;
	zodSchema?: ZodSchema;
}) {
	const id =
		typeof data === "number" || typeof data === "string" ? data : data?.id;

	const withIdText = id ? ` with id "${id}"` : "";
	if (!response.ok) {
		throw new Error(
			`Failed to ${crudAction} ${resourceName} item${withIdText}: ${response.status} -> ${response.statusText}`,
		);
	}

	const json = await response.json();
	if (json.error === "Unauthorized")
		return redirect(`${env.server.NEXT_PUBLIC_BASE_URL}/login`);
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
