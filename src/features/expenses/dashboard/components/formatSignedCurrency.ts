import type { ExpenseDashboard } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";

export function formatSignedCurrency(
	value: number,
	currency: ExpenseDashboard["currency"],
) {
	if (value === 0) return formatCurrency(0, currency);
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value), currency)}`;
}
