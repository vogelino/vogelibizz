"use client";

import { useQuery } from "@tanstack/react-query";
import { type SettingsType, settingsSelectSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

function useSettings() {
	const queryFn = createQueryFunction<SettingsType>({
		resourceName: "settings",
		action: "queryAll",
		outputZodSchema: settingsSelectSchema,
	});
	return useQuery({
		...queryKeys.settings.current,
		queryFn,
	});
}

export default useSettings;
