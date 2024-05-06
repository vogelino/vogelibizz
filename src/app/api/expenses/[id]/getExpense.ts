import db from "@/db";
import { expenses } from "@/db/schema";
import { getExpensesWithMonthlyClpPrice } from "@/utility/expenseFetchUtil";
import { eq } from "drizzle-orm";

export async function getExpense(id: number) {
	const expense = await db.query.expenses.findFirst({
		where: eq(expenses.id, id),
	});
	if (!expense) throw new Error(`Project with id '${id}' does not exist`);
	const [expenseWithMonthlyCLPPrice] =
		(await getExpensesWithMonthlyClpPrice([expense])) ?? [];
	if (!expenseWithMonthlyCLPPrice)
		throw new Error(`Project with id '${id}' does not exist`);
	return expenseWithMonthlyCLPPrice;
}
