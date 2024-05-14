"use client";

import type { ResourceType } from "@/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import {
  getQueryCompletionMessage,
  singularizeResourceName,
  verbToPresentParticiple,
} from "../resourceUtil";
import type { ActionType } from "./createQueryFunction";

function createMutationHook<DataType>({
  resourceName,
  action,
  inputZodSchema,
  mutationFn,
  createOptimisticDataEntry,
}: {
  resourceName: ResourceType;
  action: ActionType;
  inputZodSchema: z.ZodType;
  mutationFn: (args?: z.infer<typeof inputZodSchema>) => Promise<void>;
  createOptimisticDataEntry: (
    old: DataType | undefined,
    data: z.infer<typeof inputZodSchema>
  ) => DataType;
}) {
  return function hook() {
    const queryClient = useQueryClient();
    const toastId = useRef<string | number | undefined>(undefined);
    return useMutation({
      mutationKey: [resourceName, action],
      mutationFn,
      onMutate: (data: z.infer<typeof inputZodSchema>) => {
        const input = inputZodSchema.parse(data);
        queryClient.cancelQueries({ queryKey: [resourceName] });
        const previousData = queryClient.getQueryData<DataType>([resourceName]);
        queryClient.setQueryData<DataType>([resourceName], (old) =>
          createOptimisticDataEntry(old, input)
        );
        const pastPrincipe = verbToPresentParticiple(action);
        const capitalizedPrinciple =
          pastPrincipe.charAt(0).toUpperCase() + pastPrincipe.slice(1);
        const singularAcrtion = singularizeResourceName(resourceName);
        const nameSuffix =
          typeof input === "object" && "name" in input
            ? ` "${input.name}"`
            : "";
        toastId.current = toast.loading(
          `${capitalizedPrinciple} ${singularAcrtion}${nameSuffix}...`
        );
        return { previousData };
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
          context?.previousData
        );
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
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: [resourceName] }),
    });
  };
}

export default createMutationHook;
