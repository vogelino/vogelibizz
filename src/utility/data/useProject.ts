import { projectSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const projectsQueryKey = ["projects"];
const useProject = createResourceQueryHook({
  resourceName: "projects",
  responseZodSchema: projectSelectSchema,
  single: true,
});

export default useProject;
