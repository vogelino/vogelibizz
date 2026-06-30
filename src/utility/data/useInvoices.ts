"use client";

import { useQuery } from "@tanstack/react-query";
import type { InvoiceType } from "@/db/schema";
import { invoicesQueryOptions } from "@/utility/data/queryOptions";

function useInvoices({
	enabled = true,
	initialData,
}: {
	enabled?: boolean;
	initialData?: InvoiceType[];
} = {}) {
	return useQuery({
		...invoicesQueryOptions(),
		enabled,
		...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
	});
}

export default useInvoices;
