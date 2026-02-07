import {
	createQueryKeys,
	mergeQueryKeys,
} from "@lukemorales/query-key-factory";
import type { ResourceType } from "@/db/schema";

const projects = createQueryKeys("projects", {
	list: null,
	detail: (id: string | number) => [String(id)],
});

const clients = createQueryKeys("clients", {
	list: null,
	detail: (id: string | number) => [String(id)],
});

const expenses = createQueryKeys("expenses", {
	list: null,
	detail: (id: string | number) => [String(id)],
});

export const queryKeys = mergeQueryKeys(projects, clients, expenses);
export type QueryResourceKey = Extract<
	ResourceType,
	keyof typeof queryKeys
>;
