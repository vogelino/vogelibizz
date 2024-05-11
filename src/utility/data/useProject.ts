import { projectSelectSchema, type ProjectType } from "@/db/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import createQueryFunction from "./createQueryFunction";

type DataType = ProjectType;
const resourceName = "projects";
const action = "querySingle";
const outputZodSchema = projectSelectSchema;

function useProject(id?: string | number) {
  const queryKey = [resourceName, `${id}`];
  if (!id)
    return {
      data: null,
      isPending: false,
      error: null,
    };
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
