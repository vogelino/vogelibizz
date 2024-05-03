import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { ZodSchema, z } from "zod";

export function handleSupabaseResponse<T extends ZodSchema>({
	response,
	schema,
}: {
	response: PostgrestSingleResponse<unknown[]>;
	schema: T;
}): z.infer<T> {
	if (response.error) throw new Error(response.error.message);

	if (response.status !== 200) throw new Error(response.statusText);

	const parsedClients = schema.parse(response.data);

	return parsedClients;
}
