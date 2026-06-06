"use client";

import { useQuery } from "@tanstack/react-query";
import type { SettingsType } from "@/db/schema";
import { settingsQueryOptions } from "@/utility/data/queryOptions";

function useSettings(initialData?: SettingsType) {
	return useQuery({
		...settingsQueryOptions(),
		...(initialData ? { initialData, initialDataUpdatedAt: Date.now() } : {}),
	});
}

export default useSettings;
