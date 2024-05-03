import { projectStatusEnum } from "@/db/schema";
import { supabaseClient } from "@/utility/supabase-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { handleSupabaseResponse } from "./supabaseUtil";

export const ProjectZodSchema = z.object({
	id: z.number(),
	name: z.string(),
	created_at: z.string(),
	last_modified: z.string(),
	description: z.union([z.string(), z.null()]).optional(),
	status: z.enum(projectStatusEnum.enumValues).default("todo"),
	content: z.union([z.string(), z.null()]).default(""),
});
export type ProjectType = z.infer<typeof ProjectZodSchema>;

function useProjects() {
	const queryKey = ["projects"];
	const { data, isPending, error } = useSuspenseQuery({
		queryKey,
		queryFn: getProjects,
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getProjects() {
	const response = await supabaseClient.from("projects").select("*");
	return handleSupabaseResponse({
		response,
		schema: ProjectZodSchema.array(),
	});
}

export default useProjects;
