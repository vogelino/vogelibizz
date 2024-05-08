import { type ProjectType, projectSelectSchema } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createQueryFunction } from "./createDataHook";

type DataType = ProjectType;
const resourceName = "projects";
const action = "querySingle";
const outputZodSchema = projectSelectSchema;

function useProject(id: DataType["id"]) {
	const queryKey = [resourceName, id];
	return useSuspenseQuery<DataType>({
		queryKey,
		queryFn: createQueryFunction<DataType>({
			resourceName,
			action,
			outputZodSchema,
			id,
		}),
	});
}

export default useProject;
