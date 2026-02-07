"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsSelectSchema, type CurrencyIdType } from "@/db/schema";
import env from "@/env";
import { handleFetchResponse } from "@/utility/dataHookUtil";
import { queryKeys } from "@/utility/queryKeys";

function useSettingsUpdate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["settings", "update"],
		mutationFn: async (targetCurrency: CurrencyIdType) => {
			const response = await fetch(
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
			queryClient.setQueryData(queryKeys.settings.current.queryKey, settings);
			queryClient.invalidateQueries({
				queryKey: queryKeys.expenses.list.queryKey,
			});
		},
	});
}

export default useSettingsUpdate;
