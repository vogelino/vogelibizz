"use client";

import { useQuery } from "@tanstack/react-query";
import { expensesQueryOptions } from "@/utility/data/queryOptions";

function useExpenses({ enabled = true }: { enabled?: boolean } = {}) {
	return useQuery({
		...expensesQueryOptions(),
		enabled,
	});
}

export default useExpenses;
