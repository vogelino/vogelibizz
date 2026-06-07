"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import type { RoutedResource } from "@/utility/routedResources";
import {
	getQueryCompletionMessage,
	singularizeResourceName,
	verbToPresentParticiple,
} from "../resourceUtil";
import type { ActionType } from "./createQueryFunction";
import { resourceQueryFactories } from "./queryFactories";

function createMutationHook<DataType, SchemaData>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn,
	createOptimisticDataEntry,
}: {
	resourceName: RoutedResource;
	action: ActionType;
	inputZodSchema: z.ZodType<SchemaData>;
	mutationFn: (args: SchemaData) => Promise<void>;
	createOptimisticDataEntry: (
		old: DataType | undefined,
		data: SchemaData,
	) => DataType;
}) {
	return function hook() {
		const queryClient = useQueryClient();
		const toastId = useRef<string | number | undefined>(undefined);
		return useMutation({
			mutationKey: [resourceName, action],
			mutationFn,
			onMutate: (data: SchemaData) => {
				const input = inputZodSchema.parse(data);
				const resourceQueries = resourceQueryFactories[resourceName];
				const listQuery = resourceQueries.list();
				queryClient.cancelQueries({ queryKey: listQuery.queryKey });
				const previousData = queryClient.getQueryData<DataType>(
					listQuery.queryKey,
				);
				queryClient.setQueryData<DataType>(listQuery.queryKey, (old) =>
					createOptimisticDataEntry(old, input),
				);
				const previousSingleData = new Map<string, () => void>();
				const candidates = Array.isArray(input) ? input : [input];
				candidates.forEach((candidate) => {
					if (!candidate || typeof candidate !== "object") {
						return;
					}
					const id = "id" in candidate ? String(candidate.id ?? "") : "";
					if (!id) return;
					const detailQuery = resourceQueries.detail(id);
					const prevData = queryClient.getQueryData(detailQuery.queryKey);
					previousSingleData.set(id, () =>
						queryClient.setQueryData(detailQuery.queryKey, prevData as never),
					);
					queryClient.setQueryData(detailQuery.queryKey, (old) =>
						old && typeof old === "object"
							? { ...old, ...candidate }
							: candidate,
					);
				});
				const pastPrincipe = verbToPresentParticiple(action);
				const capitalizedPrinciple =
					pastPrincipe.charAt(0).toUpperCase() + pastPrincipe.slice(1);
				const singularAcrtion = singularizeResourceName(resourceName);
				const nameSuffix =
					input && typeof input === "object" && "name" in input
						? ` "${input.name}"`
						: "";
				toastId.current = toast.loading(
					`${capitalizedPrinciple} ${singularAcrtion}${nameSuffix}...`,
				);
				return { previousData, previousSingleData };
			},
			onSuccess: (_data, data) => {
				const successMessage = getQueryCompletionMessage({
					action,
					resourceName,
					data,
					resolution: "success",
				});
				toast.success(successMessage, {
					id: toastId.current,
					onAutoClose() {
						toastId.current = undefined;
					},
				});
			},
			onError: (err, data, context) => {
				const resourceQueries = resourceQueryFactories[resourceName];
				queryClient.setQueryData<DataType>(
					resourceQueries.list().queryKey,
					context?.previousData,
				);
				context?.previousSingleData?.forEach((restore) => {
					restore();
				});
				const errorMessage = getQueryCompletionMessage({
					action,
					resourceName,
					data,
					resolution: "failure",
				});
				toast.error(errorMessage, {
					description: String(err),
					id: toastId.current,
					onAutoClose() {
						toastId.current = undefined;
					},
				});
			},
			onSettled: (_data, _error, variables) => {
				const resourceQueries = resourceQueryFactories[resourceName];
				queryClient.invalidateQueries({
					queryKey: resourceQueries.list().queryKey,
				});
				const parsedVariables = inputZodSchema.safeParse(variables);
				if (parsedVariables.success) {
					const candidates = Array.isArray(parsedVariables.data)
						? parsedVariables.data
						: [parsedVariables.data];
					candidates.forEach((candidate) => {
						if (!candidate || typeof candidate !== "object") {
							return;
						}
						const id = "id" in candidate ? String(candidate.id ?? "") : "";
						if (!id) return;
						const detailQuery = resourceQueries.detail(id);
						queryClient.invalidateQueries({
							queryKey: detailQuery.queryKey,
						});
					});
				}
			},
		});
	};
}

export default createMutationHook;
