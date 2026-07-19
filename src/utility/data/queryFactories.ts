import {
	createQueryKeys,
	mergeQueryKeys,
} from "@lukemorales/query-key-factory";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
	type ClientType,
	type CurrencyIdType,
	clientSelectSchema,
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
	type InvoiceType,
	invoiceSelectSchema,
	type ProjectType,
	projectSelectSchema,
	type ResourceType,
	type SettingsType,
	settingsSelectSchema,
} from "@/db/schema";
import type { Session } from "@/providers/SessionProvider";
import {
	type ExpenseHistoryMonthDetail,
	type ExpenseHistoryMonthSummary,
	type ExpenseHistoryTransactionDetail,
	type ExpenseOverviewSummary,
	expenseHistoryMonthDetailSchema,
	expenseHistoryMonthsSchema,
	expenseHistoryTransactionDetailSchema,
	expenseOverviewSummarySchema,
} from "@/utility/expenseHistoryContracts";
import { parseId } from "@/utility/resourceUtil";
import { apiFetch, apiGetJson } from "../dataHookUtil";
import createQueryFunction from "./createQueryFunction";

const queryKeys = mergeQueryKeys(
	createQueryKeys("projects", {
		list: null,
		detail: (id: string | number) => [String(id)],
	}),
	createQueryKeys("clients", {
		list: null,
		detail: (id: string | number) => [String(id)],
	}),
	createQueryKeys("expenses", {
		list: null,
		detail: (id: string | number) => [String(id)],
	}),
	createQueryKeys("invoices", {
		list: null,
		detail: (id: string | number) => [String(id)],
	}),
	createQueryKeys("settings", {
		current: null,
	}),
	createQueryKeys("exchangeRates", {
		current: null,
	}),
	createQueryKeys("expenseHistory", {
		months: null,
		month: (month: string | null) => [month ?? "all"],
		transaction: (id: string | number) => ["transaction", String(id)],
		overview: null,
	}),
);

export type QueryResourceKey = Extract<ResourceType, keyof typeof queryKeys>;

export const projectsQuery = {
	list: () =>
		queryOptions({
			...queryKeys.projects.list,
			queryFn: async () => {
				if (import.meta.env.SSR) {
					const { getProjects } = await import(
						"@/server/api/projects/getProjects"
					);
					return getProjects();
				}
				return createQueryFunction<ProjectType[]>({
					resourceName: "projects",
					action: "queryAll",
					outputZodSchema: projectSelectSchema.array(),
				})();
			},
		}),
	detail: (id: string | number) =>
		queryOptions({
			...queryKeys.projects.detail(id),
			queryFn: async () => {
				const parsedId = parseId(id);
				if (import.meta.env.SSR) {
					const { getProject } = await import(
						"@/server/api/projects/getProject"
					);
					return getProject(parsedId);
				}
				return createQueryFunction<ProjectType>({
					resourceName: "projects",
					action: "querySingle",
					outputZodSchema: projectSelectSchema,
					id: parsedId,
				})();
			},
		}),
};

export const clientsQuery = {
	list: () =>
		queryOptions({
			...queryKeys.clients.list,
			queryFn: async () => {
				if (import.meta.env.SSR) {
					const { getClients } = await import(
						"@/server/api/clients/getClients"
					);
					return getClients();
				}
				return createQueryFunction<ClientType[]>({
					resourceName: "clients",
					action: "queryAll",
					outputZodSchema: clientSelectSchema.array(),
				})();
			},
		}),
	detail: (id: string | number) =>
		queryOptions({
			...queryKeys.clients.detail(id),
			queryFn: async () => {
				const parsedId = parseId(id);
				if (import.meta.env.SSR) {
					const { getClient } = await import("@/server/api/clients/getClient");
					return getClient(parsedId);
				}
				return createQueryFunction<ClientType>({
					resourceName: "clients",
					action: "querySingle",
					outputZodSchema: clientSelectSchema,
					id: parsedId,
				})();
			},
		}),
};

export const expensesQuery = {
	list: () =>
		queryOptions({
			...queryKeys.expenses.list,
			queryFn: async () => {
				if (import.meta.env.SSR) {
					const { getExpenses } = await import(
						"@/server/api/expenses/getExpenses"
					);
					return getExpenses();
				}
				return createQueryFunction<ExpenseWithMonthlyCLPPriceType[]>({
					resourceName: "expenses",
					action: "queryAll",
					outputZodSchema: expenseWithMonthlyCLPPriceSchema.array(),
				})();
			},
		}),
	detail: (id: string | number) =>
		queryOptions({
			...queryKeys.expenses.detail(id),
			queryFn: async () => {
				const parsedId = parseId(id);
				if (import.meta.env.SSR) {
					const { getExpense } = await import(
						"@/server/api/expenses/getExpense"
					);
					return getExpense(parsedId);
				}
				return createQueryFunction<ExpenseWithMonthlyCLPPriceType>({
					resourceName: "expenses",
					action: "querySingle",
					outputZodSchema: expenseWithMonthlyCLPPriceSchema,
					id: parsedId,
				})();
			},
		}),
};

export const invoicesQuery = {
	list: () =>
		queryOptions({
			...queryKeys.invoices.list,
			queryFn: async () => {
				if (import.meta.env.SSR) {
					const { getInvoices } = await import(
						"@/server/api/invoices/getInvoices"
					);
					return getInvoices();
				}
				return createQueryFunction<InvoiceType[]>({
					resourceName: "invoices",
					action: "queryAll",
					outputZodSchema: invoiceSelectSchema.array(),
				})();
			},
		}),
	detail: (id: string | number) =>
		queryOptions({
			...queryKeys.invoices.detail(id),
			queryFn: async () => {
				const parsedId = parseId(id);
				if (import.meta.env.SSR) {
					const { getInvoice } = await import(
						"@/server/api/invoices/getInvoice"
					);
					return getInvoice(parsedId);
				}
				return createQueryFunction<InvoiceType>({
					resourceName: "invoices",
					action: "querySingle",
					outputZodSchema: invoiceSelectSchema,
					id: parsedId,
				})();
			},
		}),
};

export const settingsQuery = {
	current: () =>
		queryOptions({
			...queryKeys.settings.current,
			queryFn: async (): Promise<SettingsType> => {
				if (import.meta.env.SSR) {
					const { getSettings } = await import(
						"@/server/api/settings/getSettings"
					);
					return getSettings();
				}
				return createQueryFunction<SettingsType>({
					resourceName: "settings",
					action: "queryAll",
					outputZodSchema: settingsSelectSchema,
				})();
			},
		}),
};

export const exchangeRatesQuery = {
	current: () =>
		queryOptions({
			...queryKeys.exchangeRates.current,
			staleTime: 6 * 60 * 60 * 1000,
			queryFn: async (): Promise<Record<CurrencyIdType, number>> => {
				if (import.meta.env.SSR) {
					const { getExchangeRatesRecord } = await import(
						"@/server/api/currencies/getExchangeRates"
					);
					return getExchangeRatesRecord();
				}
				const res = await apiFetch("/api/exchange-rates");
				if (!res.ok) throw new Error("Failed to fetch exchange rates");
				return res.json();
			},
		}),
};

export const expenseHistoryQuery = {
	overview: () =>
		queryOptions({
			...queryKeys.expenseHistory.overview,
			queryFn: async (): Promise<ExpenseOverviewSummary> => {
				if (import.meta.env.SSR) {
					const { getExpenseOverviewSummary } = await import(
						"@/server/expenseHistory/getExpenseHistory"
					);
					return getExpenseOverviewSummary();
				}
				return expenseOverviewSummarySchema.parse(
					await apiGetJson("/api/expense-history/overview"),
				);
			},
		}),
	months: () =>
		queryOptions({
			...queryKeys.expenseHistory.months,
			queryFn: async (): Promise<ExpenseHistoryMonthSummary[]> => {
				if (import.meta.env.SSR) {
					const { getExpenseHistoryMonths } = await import(
						"@/server/expenseHistory/getExpenseHistory"
					);
					return getExpenseHistoryMonths();
				}
				return expenseHistoryMonthsSchema.parse(
					await apiGetJson("/api/expense-history/months"),
				);
			},
		}),
	month: (month: string | null) =>
		infiniteQueryOptions({
			...queryKeys.expenseHistory.month(month),
			initialPageParam: 0,
			queryFn: async ({ pageParam }): Promise<ExpenseHistoryMonthDetail> => {
				if (import.meta.env.SSR) {
					const { getExpenseHistoryMonth } = await import(
						"@/server/expenseHistory/getExpenseHistory"
					);
					const result = await getExpenseHistoryMonth(month, {
						offset: pageParam,
						limit: 50,
					});
					if (!result)
						throw new Error(`No expense history exists for ${month}.`);
					return result;
				}
				return expenseHistoryMonthDetailSchema.parse(
					await apiGetJson(
						`/api/expense-history/months/${month ? encodeURIComponent(month) : "all"}?offset=${pageParam}&limit=50`,
					),
				);
			},
			getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		}),
	transaction: (id: string | number) =>
		queryOptions({
			...queryKeys.expenseHistory.transaction(id),
			queryFn: async (): Promise<ExpenseHistoryTransactionDetail> => {
				const parsedId = parseId(id);
				if (import.meta.env.SSR) {
					const { getExpenseHistoryTransaction } = await import(
						"@/server/expenseHistory/getExpenseHistory"
					);
					const result = await getExpenseHistoryTransaction(parsedId);
					if (!result) throw new Error("Transaction not found.");
					return result;
				}
				return expenseHistoryTransactionDetailSchema.parse(
					await apiGetJson(`/api/expense-history/transactions/${parsedId}`),
				);
			},
		}),
};

export const sessionQuery = {
	current: (signal?: AbortSignal) =>
		queryOptions({
			queryKey: ["auth", "session"],
			queryFn: async (): Promise<Session> => {
				const response = await apiFetch("/api/auth/session", { signal });
				if (!response.ok) throw new Error("Failed to fetch session");
				const data = await response.json();
				return Object.keys(data || {}).length ? data : null;
			},
		}),
};

export const resourceQueryFactories = {
	projects: projectsQuery,
	clients: clientsQuery,
	expenses: expensesQuery,
	invoices: invoicesQuery,
	settings: settingsQuery,
};

export const queryFactories = {
	...resourceQueryFactories,
	settings: settingsQuery,
	session: sessionQuery,
	exchangeRates: exchangeRatesQuery,
	expenseHistory: expenseHistoryQuery,
};

export const projectsQueryOptions = projectsQuery.list;
export const projectQueryOptions = projectsQuery.detail;
export const clientsQueryOptions = clientsQuery.list;
export const clientQueryOptions = clientsQuery.detail;
export const expensesQueryOptions = expensesQuery.list;
export const expenseQueryOptions = expensesQuery.detail;
export const invoicesQueryOptions = invoicesQuery.list;
export const invoiceQueryOptions = invoicesQuery.detail;
export const settingsQueryOptions = settingsQuery.current;
export const sessionQueryOptions = sessionQuery.current;
export const exchangeRatesQueryOptions = exchangeRatesQuery.current;
export const expenseHistoryMonthsQueryOptions = expenseHistoryQuery.months;
export const expenseHistoryMonthQueryOptions = expenseHistoryQuery.month;
export const expenseHistoryMonthQueriesKey = [
	"expenseHistory",
	"month",
] as const;
export const expenseHistoryTransactionQueryOptions =
	expenseHistoryQuery.transaction;
export const expenseOverviewSummaryQueryOptions = expenseHistoryQuery.overview;
