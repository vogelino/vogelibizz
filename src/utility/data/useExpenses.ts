"use client";

import { expenseWithMonthlyCLPPriceSchema } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleFetchResponse } from "../dataHookUtil";

export const expensesQueryKey = ["expenses"];
function useExpenses() {
	const { data, isPending, error } = useSuspenseQuery({
		queryKey: expensesQueryKey,
		queryFn: getExpenses,
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getExpenses() {
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses`,
	);
	return handleFetchResponse({
		response,
		crudAction: "query",
		resourceName: "expenses",
		zodSchema: expenseWithMonthlyCLPPriceSchema.array(),
	});
}

export default useExpenses;
