"use client";

import type { ExpenseType } from "@/db/schema";
import env from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

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
    `${env.client.NEXT_PUBLIC_BASE_URL}/api/expenses`
  );
  const json = await response.json();

  if (json.error === "Unauthorized") return redirect("/login");
  if (json.error) throw new Error(json.error);

  return json as ExpenseType[];
}

export default useExpenses;
