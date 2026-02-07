import { useQuery } from "@tanstack/react-query";
import { type ProjectType, projectSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

type DataType = ProjectType;

function useProject(id?: string | number, initialData?: DataType) {
	const parsedId = id ? Number(id) : undefined;
	const query =
		parsedId === undefined
			? queryKeys.projects.detail("")
			: queryKeys.projects.detail(parsedId);
	const queryFn = createQueryFunction<ProjectType>({
		resourceName: "projects",
		action: "querySingle",
		outputZodSchema: projectSelectSchema,
		id: parsedId ?? "",
	});
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};
	return useQuery({
		...query,
		queryFn,
		enabled: Number.isFinite(parsedId),
		...initialDataOptions,
	});
}

export default useProject;
