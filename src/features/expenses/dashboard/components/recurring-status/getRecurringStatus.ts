import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import type { ExpenseDashboardRecurringComparison } from "../../expenseDashboardComparison";

type RecurringStatusOptions = {
	expense: ExpenseDashboardRecurringComparison;
	currentTitle: string;
	currency: ExpenseDashboard["currency"];
};

const ratesWithMultipleExpectedCharges = new Set([
	"Daily",
	"Hourly",
	"Weekly",
	"Bi-Weekly",
]);

export function getRecurringStatus({
	expense,
	currentTitle,
	currency,
}: RecurringStatusOptions) {
	if (expense.expectation === "not-due") {
		return `${expense.rate} · not due in ${currentTitle}`;
	}
	if (expense.expectation === "unknown") {
		return `${expense.rate} · billing month unknown`;
	}
	if (
		!ratesWithMultipleExpectedCharges.has(expense.rate) &&
		expense.currentTransactionCount > 1
	) {
		return `${expense.currentTransactionCount} charges detected`;
	}
	if (expense.currentActual === 0) {
		return `${expense.rate} · expected in ${currentTitle}`;
	}

	const difference = expense.currentActual - expense.expectedThisMonth;
	if (difference > 0.01) {
		return `${formatCurrency(difference, currency)} over plan`;
	}
	if (difference < -0.01) {
		return `${formatCurrency(Math.abs(difference), currency)} still expected`;
	}
	return "On plan";
}
