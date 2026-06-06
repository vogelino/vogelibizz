import { useQuery } from "@tanstack/react-query";
import type { ProjectType } from "@/db/schema";
import { projectQueryOptions } from "@/utility/data/queryOptions";

type DataType = ProjectType;

function useProject(id?: string | number, initialData?: DataType) {
	const parsedId = id ? Number(id) : undefined;
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};

	return useQuery({
		...projectQueryOptions(parsedId ?? ""),
		enabled: Number.isFinite(parsedId),
		...initialDataOptions,
	});
}

export default useProject;
