import { supabaseClient } from "@/utility/supabase-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { handleSupabaseResponse } from "./supabaseUtil";

export const ClientZodSchema = z.object({
	id: z.number(),
	name: z.string(),
	created_at: z.string(),
	last_modified: z.string(),
});
export type ClientType = z.infer<typeof ClientZodSchema>;

function useClients() {
	const queryKey = ["clients"];
	const { data, isPending, error } = useSuspenseQuery({
		queryKey,
		queryFn: getClients,
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getClients() {
	const response = await supabaseClient.from("clients").select("*");
	return handleSupabaseResponse({
		response,
		schema: ClientZodSchema.array(),
	});
}

export default useClients;
