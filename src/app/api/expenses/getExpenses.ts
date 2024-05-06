import db from "@/db";
import { getExpensesWithMonthlyClpPrice } from "@/utility/expenseFetchUtil";

export async function getExpenses() {
	const expenses = await db.query.expenses.findMany();
	console.log(`Retrieved ${expenses.length} expenses from db`);
	const expensesWithMonthlyCLPPrice =
		await getExpensesWithMonthlyClpPrice(expenses);
	console.log(
		`Retrieved ${expensesWithMonthlyCLPPrice.length} expenses with monthly CLP price`,
	);
	return expensesWithMonthlyCLPPrice;
}
