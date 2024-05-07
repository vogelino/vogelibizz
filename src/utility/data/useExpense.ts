import { expenseWithMonthlyCLPPriceSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const expensesQueryKey = ["expenses"];
const useExpense = createResourceQueryHook({
	resourceName: "expenses",
	responseZodSchema: expenseWithMonthlyCLPPriceSchema,
	single: true,
});

export default useExpense;
