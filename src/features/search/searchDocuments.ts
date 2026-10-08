import type {
	ClientType,
	ExpenseWithMonthlyCLPPriceType,
	InvoiceType,
	ProjectType,
} from "@/db/schema";
import {
	getInvoiceHours,
	getInvoiceTotal,
} from "@/features/invoices/invoiceTotals";
import type { ExpenseHistoryTransaction } from "@/utility/expenseHistoryContracts";
import { formatCurrency } from "@/utility/formatUtil";
import { amountSearchText } from "./searchEngine";
import type { SearchDocument, SearchFilterOption } from "./searchTypes";

const text = (...values: unknown[]) =>
	values
		.flatMap((value) => (Array.isArray(value) ? value : [value]))
		.filter((value): value is string | number => value != null)
		.join(" ");

export function createSearchDocuments({
	clients,
	projects,
	invoices,
	expenses,
	transactions,
}: {
	clients: readonly ClientType[];
	projects: readonly ProjectType[];
	invoices: readonly InvoiceType[];
	expenses: readonly ExpenseWithMonthlyCLPPriceType[];
	transactions: readonly ExpenseHistoryTransaction[];
}): SearchDocument[] {
	return [
		...clients.map(
			(client): SearchDocument => ({
				id: `client:${client.id}`,
				resourceId: String(client.id),
				kind: "client",
				scope: "clients",
				title: client.name,
				subtitle: text(client.legalName, client.clientNumber),
				keywords: text(
					client.id,
					client.legalName,
					client.clientNumber,
					client.taxId,
					client.projects?.map(({ name }) => name),
				),
			}),
		),
		...projects.map(
			(project): SearchDocument => ({
				id: `project:${project.id}`,
				resourceId: String(project.id),
				kind: "project",
				scope: "projects",
				title: project.name,
				subtitle: text(
					project.status.replaceAll("_", " "),
					project.clients?.map(({ name }) => name),
					`${project.hourlyRate}/hour`,
				),
				keywords: text(
					project.id,
					project.description,
					project.content,
					project.status,
					amountSearchText(project.hourlyRate),
					project.clients?.map(({ name }) => name),
				),
				status: project.status,
			}),
		),
		...invoices.map(
			(invoice): SearchDocument => ({
				id: `invoice:${invoice.id}`,
				resourceId: String(invoice.id),
				kind: "invoice",
				scope: "invoices",
				title: invoice.name,
				subtitle: text(
					`#${invoice.invoiceNumber}`,
					invoice.clients?.map(({ name }) => name),
					formatCurrency(getInvoiceTotal(invoice), invoice.currency),
				),
				keywords: text(
					invoice.id,
					invoice.invoiceNumber,
					invoice.subject,
					amountSearchText(getInvoiceTotal(invoice), invoice.currency),
					amountSearchText(invoice.hourlyRate, invoice.currency),
					getInvoiceHours(invoice),
					invoice.clients?.map(({ name }) => name),
					invoice.projects?.map(({ name }) => name),
					invoice.rows.map(({ description }) => description),
					invoice.rows.map(({ hoursCount }) =>
						amountSearchText(hoursCount * invoice.hourlyRate, invoice.currency),
					),
				),
			}),
		),
		...expenses.map(
			(expense): SearchDocument => ({
				id: `expense:${expense.id}`,
				resourceId: String(expense.id),
				kind: "expense",
				scope: "expenses",
				title: expense.name,
				subtitle: text(
					expense.category,
					expense.type,
					formatCurrency(expense.originalPrice, expense.originalCurrency),
				),
				keywords: text(
					expense.id,
					expense.category,
					expense.type,
					expense.rate,
					expense.originalCurrency,
					amountSearchText(expense.originalPrice, expense.originalCurrency),
					amountSearchText(expense.clpMonthlyPrice),
				),
				category: expense.category,
				type: expense.type,
			}),
		),
		...transactions.map(
			(transaction): SearchDocument => ({
				id: `expense-transaction:${transaction.id}`,
				resourceId: String(transaction.id),
				kind: "expense-transaction",
				scope: "expense-history",
				title: transaction.description,
				subtitle: text(
					transaction.bookedAt,
					transaction.expense?.name,
					formatCurrency(transaction.originalAmount, "CHF"),
				),
				keywords: text(
					transaction.id,
					transaction.originalDescription,
					transaction.bookedAt,
					transaction.category,
					transaction.type,
					transaction.expense?.name,
					amountSearchText(transaction.amount),
					amountSearchText(transaction.originalAmount, "CHF"),
				),
				category: transaction.category ?? undefined,
				type: transaction.type ?? undefined,
				month: transaction.bookedAt.slice(0, 7),
			}),
		),
	];
}

export function createSearchFilterOptions(
	categories: readonly string[],
	types: readonly string[],
): SearchFilterOption[] {
	return [
		...categories.map((category) => ({
			id: `category:${category}`,
			filter: "category" as const,
			value: category,
			label: `Category: ${category}`,
			keywords: `filter category ${category}`,
			scopes:
				category === "Mixed"
					? (["expenses"] as const)
					: (["expenses", "expense-history"] as const),
		})),
		...types.map((type) => ({
			id: `type:${type}`,
			filter: "type" as const,
			value: type,
			label: `Type: ${type}`,
			keywords: `filter type ${type}`,
			scopes:
				type === "Mixed"
					? (["expenses"] as const)
					: (["expenses", "expense-history"] as const),
		})),
	];
}
