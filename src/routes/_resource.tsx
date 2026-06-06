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
import { settingsQueryOptions } from "@/utility/data/queryOptions";

export const Route = createFileRoute("/_resource")({
	beforeLoad: async () => {
		if (!import.meta.env.SSR) return;
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
	loader: async ({ context }) => {
		return {
			settings: await context.queryClient.ensureQueryData(
				settingsQueryOptions(),
			),
		};
	},
	component: ResourceLayout,
});

function ResourceLayout() {
	const { data, status } = useSession();
	const { settings } = Route.useLoaderData() as { settings: SettingsType };
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	if (hydrated && status !== "loading" && !data) {
		return <Navigate to="/login" replace />;
	}
	return (
		<PageLayout settings={settings}>
			<Outlet />
		</PageLayout>
	);
}
