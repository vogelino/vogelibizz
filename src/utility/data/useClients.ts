import { clientSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const clientsQueryKey = ["clients"];
const useClients = createResourceQueryHook({
	resourceName: "clients",
	responseZodSchema: clientSelectSchema.array(),
});

export default useClients;
