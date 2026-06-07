import {
	createQueryKeys,
	mergeQueryKeys,
} from "@lukemorales/query-key-factory";
import { queryOptions } from "@tanstack/react-query";
import {
	type ClientType,
	clientSelectSchema,
	type ExpenseWithMonthlyCLPPriceType,
	expenseWithMonthlyCLPPriceSchema,
	type ProjectType,
	projectSelectSchema,
	type ResourceType,
	type SettingsType,
	settingsSelectSchema,
} from "@/db/schema";
import type { Session } from "@/providers/SessionProvider";
import { parseId } from "@/utility/resourceUtil";
import { apiFetch } from "../dataHookUtil";
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
	createQueryKeys("settings", {
		current: null,
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
	settings: settingsQuery,
};

export const queryFactories = {
	...resourceQueryFactories,
	settings: settingsQuery,
	session: sessionQuery,
};

export const projectsQueryOptions = projectsQuery.list;
export const projectQueryOptions = projectsQuery.detail;
export const clientsQueryOptions = clientsQuery.list;
export const clientQueryOptions = clientsQuery.detail;
export const expensesQueryOptions = expensesQuery.list;
export const expenseQueryOptions = expensesQuery.detail;
export const settingsQueryOptions = settingsQuery.current;
export const sessionQueryOptions = sessionQuery.current;
