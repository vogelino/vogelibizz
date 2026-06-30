"use client";

import { z } from "zod";
import type { InvoiceType, ResourceType } from "@/db/schema";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "invoices";
const action = "delete" satisfies ActionType;
const inputZodSchema = z.number();

const useInvoiceDelete = createMutationHook<InvoiceType[], InvoiceType["id"]>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void>({
		resourceName,
		action,
	}),
	createOptimisticDataEntry,
});

export default useInvoiceDelete;

function createOptimisticDataEntry(
	oldData: InvoiceType[] | undefined,
	deletedId: InvoiceType["id"],
): InvoiceType[] {
	return (oldData || []).filter((invoice) => invoice.id !== deletedId);
}
