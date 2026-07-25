import type {
	ClientType,
	ExpenseWithMonthlyCLPPriceType,
	InvoiceType,
	ProjectType,
} from "@/db/schema";
import type { ExpenseHistoryTransaction } from "@/utility/expenseHistoryContracts";
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
				),
				keywords: text(
					project.id,
					project.description,
					project.content,
					project.status,
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
				),
				keywords: text(
					invoice.id,
					invoice.invoiceNumber,
					invoice.subject,
					invoice.clients?.map(({ name }) => name),
					invoice.projects?.map(({ name }) => name),
					invoice.rows.map(({ description }) => description),
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
				subtitle: text(expense.category, expense.type),
				keywords: text(
					expense.id,
					expense.category,
					expense.type,
					expense.rate,
					expense.originalCurrency,
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
				subtitle: text(transaction.bookedAt, transaction.expense?.name),
				keywords: text(
					transaction.id,
					transaction.originalDescription,
					transaction.bookedAt,
					transaction.category,
					transaction.type,
					transaction.expense?.name,
				),
				category: transaction.category ?? undefined,
				type: transaction.type ?? undefined,
				month: transaction.bookedAt.slice(0, 7),
				otherOnly: transaction.expense === null,
			}),
		),
		{
			id: "expense-overview:other",
			resourceId: "other",
			kind: "expense-overview",
			scope: "expenses",
			title: "Other expenses",
			subtitle: "Unassociated imported expenses",
			keywords: "other unassociated unmatched mixed",
			category: "Mixed",
			type: "Mixed",
			otherOnly: true,
		},
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
		{
			id: "association:other",
			filter: "otherOnly",
			value: "true",
			label: "Association: Other only",
			keywords: "filter association other only unmatched unassociated",
			scopes: ["expenses", "expense-history"],
		},
	];
}
