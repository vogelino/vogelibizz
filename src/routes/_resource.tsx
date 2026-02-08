import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Navigate,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import type { SettingsType } from "@/db/schema";
import { useSession } from "@/providers/SessionProvider";
import { queryKeys } from "@/utility/queryKeys";

export const Route = createFileRoute("/_resource")({
	beforeLoad: async () => {
		if (typeof window !== "undefined") return;
		const [{ getStartContext }, { getSession }, { authConfig }, envModule] =
			await Promise.all([
				import("@tanstack/start-storage-context"),
				import("start-authjs"),
				import("@/utils/auth"),
				import("@/env"),
			]);
		const request = getStartContext({ throwIfNotFound: false })?.request;
		if (!request) return;
		const session = await getSession(request, authConfig);
		const email = session?.user?.email;
		const authenticated =
			!!email && envModule.default.server.AUTH_ADMIN_EMAILS.includes(email);
		if (!authenticated) throw redirect({ to: "/login" });
	},
	loader: async () => {
		if (typeof window !== "undefined") return { settings: null };
		const { getSettings } = await import("@/server/api/settings/getSettings");
		return { settings: await getSettings() };
	},
	component: ResourceLayout,
});

function ResourceLayout() {
	const { data, status } = useSession();
	const { settings } = Route.useLoaderData() as {
		settings: SettingsType | null;
	};
	const queryClient = useQueryClient();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!settings) return;
		queryClient.setQueryData(queryKeys.settings.current.queryKey, settings);
	}, [queryClient, settings]);

	if (hydrated && status !== "loading" && !data) {
		return <Navigate to="/login" replace />;
	}
	return (
		<PageLayout>
			<Outlet />
		</PageLayout>
	);
}
