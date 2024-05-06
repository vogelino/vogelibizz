import { projectSelectSchema } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleFetchResponse } from "../dataHookUtil";

function useProject(id: number | undefined) {
	const queryKey = ["projects", id];
	const { data, isPending, error } = useSuspenseQuery({
		queryKey,
		queryFn: () => getProject(id),
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getProject(id: number | undefined) {
	if (!id) return null;
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/projecs/${id}`,
	);
	return handleFetchResponse({
		response,
		crudAction: "query",
		resourceName: "projects",
		zodSchema: projectSelectSchema,
	});
}

export default useProject;
