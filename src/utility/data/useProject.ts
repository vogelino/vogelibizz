import { useQuery } from "@tanstack/react-query";
import { type ProjectType, projectSelectSchema } from "@/db/schema";
import createQueryFunction from "./createQueryFunction";

type DataType = ProjectType;
const resourceName = "projects";
const action = "querySingle";
const outputZodSchema = projectSelectSchema;

function useProject(id?: string | number, initialData?: DataType) {
	const parsedId = id ? Number(id) : undefined;
	const queryKey = [resourceName, `${parsedId ?? ""}`];
	return useQuery<DataType>({
		queryKey,
		enabled: Number.isFinite(parsedId),
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
			id: parsedId ?? "",
		}),
		initialData,
		initialDataUpdatedAt: initialData ? Date.now() : undefined,
	});
}

export default useProject;
