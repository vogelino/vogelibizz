import { projectSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const projectsQueryKey = ["projects"];
const useProjects = createResourceQueryHook({
	resourceName: "projects",
	responseZodSchema: projectSelectSchema.array(),
});

export default useProjects;
