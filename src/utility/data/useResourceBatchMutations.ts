"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ResourceType } from "@/db/schema";
import { apiFetch } from "@/utility/dataHookUtil";
import { singularizeResourceName } from "@/utility/resourceUtil";
import { expenseHistoryQuery, resourceQueryFactories } from "./queryFactories";

type BatchResource = Extract<ResourceType, "clients" | "projects" | "expenses">;
export type BatchEditItem = { id: number; [key: string]: unknown };

async function batchRequest(
	resource: BatchResource,
	method: "PATCH" | "DELETE",
	body: unknown,
) {
	const response = await apiFetch(`/api/${resource}/batch`, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const result = (await response.json()) as { error?: string };
		throw new Error(result.error || `${resource} batch request failed.`);
	}
}

export default function useResourceBatchMutations(resource: BatchResource) {
	const queryClient = useQueryClient();
	const listQuery = resourceQueryFactories[resource].list();
	const invalidate = async () => {
		const invalidations = [
			queryClient.invalidateQueries({ queryKey: listQuery.queryKey }),
		];
		if (resource === "clients")
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: resourceQueryFactories.projects.list().queryKey,
				}),
			);
		if (resource === "projects")
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: resourceQueryFactories.clients.list().queryKey,
				}),
			);
		if (resource === "expenses")
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: expenseHistoryQuery.overview().queryKey,
				}),
			);
		await Promise.all(invalidations);
	};
	const edit = useMutation({
		mutationKey: [resource, "batch-edit"],
		mutationFn: (items: BatchEditItem[]) =>
			batchRequest(resource, "PATCH", { items }),
		onMutate: async (items) => {
			await queryClient.cancelQueries({ queryKey: listQuery.queryKey });
			const previous = queryClient.getQueryData<BatchEditItem[]>(
				listQuery.queryKey,
			);
			const byId = new Map(items.map((item) => [item.id, item]));
			queryClient.setQueryData<BatchEditItem[]>(listQuery.queryKey, (old) =>
				(old ?? []).map((row) => ({ ...row, ...byId.get(row.id) })),
			);
			return { previous };
		},
		onSuccess: (_result, items) =>
			toast.success(
				`${items.length} ${items.length === 1 ? singularizeResourceName(resource) : resource} updated.`,
			),
		onError: (error, _items, context) => {
			queryClient.setQueryData<BatchEditItem[]>(
				listQuery.queryKey,
				context?.previous,
			);
			toast.error(`${resource} were not updated.`, {
				description: error.message,
			});
		},
		onSettled: invalidate,
	});
	const remove = useMutation({
		mutationKey: [resource, "batch-delete"],
		mutationFn: (ids: number[]) => batchRequest(resource, "DELETE", { ids }),
		onMutate: async (ids) => {
			await queryClient.cancelQueries({ queryKey: listQuery.queryKey });
			const previous = queryClient.getQueryData<BatchEditItem[]>(
				listQuery.queryKey,
			);
			const deletedIds = new Set(ids);
			queryClient.setQueryData<BatchEditItem[]>(listQuery.queryKey, (old) =>
				(old ?? []).filter(({ id }) => !deletedIds.has(id)),
			);
			return { previous };
		},
		onSuccess: (_result, ids) =>
			toast.success(
				`${ids.length} ${ids.length === 1 ? singularizeResourceName(resource) : resource} deleted.`,
			),
		onError: (error, _ids, context) => {
			queryClient.setQueryData<BatchEditItem[]>(
				listQuery.queryKey,
				context?.previous,
			);
			toast.error(`${resource} were not deleted.`, {
				description: error.message,
			});
		},
		onSettled: invalidate,
	});
	return { edit, remove };
}
