"use client";

import {
	type InvoiceEditType,
	type InvoiceType,
	invoiceEditSchema,
	type ResourceType,
} from "@/db/schema";
import { getNowInUTC } from "../timeUtil";
import createMutationHook from "./createMutationHook";
import createQueryFunction, { type ActionType } from "./createQueryFunction";

const resourceName: ResourceType = "invoices";
const action = "edit" satisfies ActionType;
const inputZodSchema = invoiceEditSchema;

const useInvoiceEdit = createMutationHook<InvoiceType[], InvoiceEditType>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn: createQueryFunction<void, InvoiceEditType>({
		resourceName,
		action,
		inputZodSchema,
	}),
	createOptimisticDataEntry,
});

export default useInvoiceEdit;

function createOptimisticDataEntry(
	oldData: InvoiceType[] | undefined,
	editedData: InvoiceEditType,
): InvoiceType[] {
	return (oldData || []).map((invoice) =>
		invoice.id === editedData.id
			? { ...invoice, ...editedData, last_modified: getNowInUTC() }
			: invoice,
	);
}
