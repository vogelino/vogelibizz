import { expenseWithMonthlyCLPPriceSchema } from "@/db/schema";
import { createResourceQueryHook } from "./createDataHook";

export const expensesQueryKey = ["expenses"];
const useExpenses = createResourceQueryHook({
	resourceName: "expenses",
	responseZodSchema: expenseWithMonthlyCLPPriceSchema.array(),
});

export default useExpenses;
