import { clientSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

const useClient = createResourceQueryHook({
	resourceName: "clients",
	responseZodSchema: clientSelectSchema,
	single: true,
});

export default useClient;
