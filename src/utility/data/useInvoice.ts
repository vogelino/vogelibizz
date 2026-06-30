"use client";

import { useQuery } from "@tanstack/react-query";
import type { InvoiceType } from "@/db/schema";
import { invoiceQueryOptions } from "@/utility/data/queryOptions";

type DataType = InvoiceType;

function useInvoice(id?: string | number, initialData?: DataType) {
	const initialDataOptions = initialData
		? { initialData, initialDataUpdatedAt: Date.now() }
		: {};
	return useQuery({
		...invoiceQueryOptions(id ?? ""),
		enabled: Boolean(id),
		...initialDataOptions,
	});
}

export default useInvoice;
