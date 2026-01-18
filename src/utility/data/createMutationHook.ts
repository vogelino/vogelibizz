"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import type { ResourceType } from "@/db/schema";
import {
	getQueryCompletionMessage,
	singularizeResourceName,
	verbToPresentParticiple,
} from "../resourceUtil";
import type { ActionType } from "./createQueryFunction";

function createMutationHook<DataType, SchemaData>({
	resourceName,
	action,
	inputZodSchema,
	mutationFn,
	createOptimisticDataEntry,
}: {
	resourceName: ResourceType;
	action: ActionType;
	inputZodSchema: z.ZodType<SchemaData>;
	mutationFn: (args?: SchemaData) => Promise<void>;
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
				queryClient.cancelQueries({ queryKey: [resourceName] });
				const previousData = queryClient.getQueryData<DataType>([resourceName]);
				queryClient.setQueryData<DataType>([resourceName], (old) =>
					createOptimisticDataEntry(old, input),
				);
				const previousSingleData = new Map<string, unknown>();
				const candidates = Array.isArray(input) ? input : [input];
				candidates.forEach((candidate) => {
					if (
						!candidate ||
						typeof candidate !== "object" ||
						!("id" in candidate)
					) {
						return;
					}
					const id = String(candidate.id ?? "");
					if (!id) return;
					previousSingleData.set(
						id,
						queryClient.getQueryData([resourceName, id]),
					);
					queryClient.setQueryData([resourceName, id], (old) =>
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
				queryClient.setQueryData<DataType>(
					[resourceName],
					context?.previousData,
				);
				context?.previousSingleData?.forEach((value, id) => {
					queryClient.setQueryData([resourceName, id], value);
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
				queryClient.invalidateQueries({ queryKey: [resourceName] });
				const parsedVariables = inputZodSchema.safeParse(variables);
				if (parsedVariables.success) {
					const candidates = Array.isArray(parsedVariables.data)
						? parsedVariables.data
						: [parsedVariables.data];
					candidates.forEach((candidate) => {
						if (
							candidate &&
							typeof candidate === "object" &&
							"id" in candidate
						) {
							queryClient.invalidateQueries({
								queryKey: [resourceName, String(candidate.id ?? "")],
							});
						}
					});
				}
			},
		});
	};
}

export default createMutationHook;
