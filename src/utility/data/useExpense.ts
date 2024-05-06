import { expenseSelectSchema } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { handleFetchResponse } from "../dataHookUtil";

function useExpense(id: number | undefined) {
	const queryKey = ["expenses", id];
	const { data, isPending, error } = useSuspenseQuery({
		queryKey,
		queryFn: () => getExpense(id),
	});

	return {
		data,
		isPending,
		error,
	};
}

export async function getExpense(id: number | undefined) {
	if (!id) return null;
	const response = await fetch(
		`${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses/${id}`,
	);

	return handleFetchResponse({
		response,
		crudAction: "query",
		resourceName: "clients",
		zodSchema: expenseSelectSchema,
	});
}

export default useExpense;
