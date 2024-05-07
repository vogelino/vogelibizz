import { expenseSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const expensesQueryKey = ["expenses"];
const useExpenses = createResourceQueryHook({
  resourceName: "expenses",
  responseZodSchema: expenseSelectSchema,
});

export default useExpenses;
