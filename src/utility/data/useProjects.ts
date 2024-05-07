import { projectSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const projectsQueryKey = ["projects"];
const useProjects = createResourceQueryHook({
  resourceName: "projects",
  responseZodSchema: projectSelectSchema,
});

export default useProjects;
