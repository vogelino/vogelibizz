import { expenseSelectSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const expensesQueryKey = ["expenses"];
const useExpense = createResourceQueryHook({
  resourceName: "expenses",
  responseZodSchema: expenseSelectSchema,
  single: true,
});

export default useExpense;
