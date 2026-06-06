"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CurrencyIdType, settingsSelectSchema } from "@/db/schema";
import env from "@/env";
import { apiFetch, handleFetchResponse } from "@/utility/dataHookUtil";
import { expensesQuery, settingsQuery } from "./queryFactories";

function useSettingsUpdate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["settings", "update"],
		mutationFn: async (targetCurrency: CurrencyIdType) => {
			const response = await apiFetch(
				`${env.client.VITE_PUBLIC_BASE_URL}/api/settings`,
				{
					method: "PUT",
					body: JSON.stringify({ targetCurrency }),
				},
			);
			return handleFetchResponse({
				response,
				crudAction: "edit",
				resourceName: "settings",
				zodSchema: settingsSelectSchema,
			});
		},
		onSuccess: (settings) => {
			queryClient.setQueryData(settingsQuery.current().queryKey, settings);
			queryClient.invalidateQueries({
				queryKey: expensesQuery.list().queryKey,
			});
		},
	});
}

export default useSettingsUpdate;
