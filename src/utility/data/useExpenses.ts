import type { ExpenseType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";

function useExpenses() {
  const queryKey = ["expenses"];
  const { data, isPending, error } = useSuspenseQuery({
    queryKey,
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
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/expenses`
  );
  const json = await response.json();

  return json as ExpenseType[];
}

export default useExpenses;
