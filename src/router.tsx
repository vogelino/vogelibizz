import {
	type DehydratedState,
	dehydrate,
	hydrate,
	type QueryClient,
} from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import type { D1Env } from "@/db/d1Types";
import { routeTree } from "./routeTree.gen";
import { createQueryClient } from "./utility/data/queryClient";

export type RouterContext = {
	queryClient: QueryClient;
};

export function getRouter() {
	const queryClient = createQueryClient();
	return createTanstackRouter({
		routeTree,
		context: {
			queryClient,
		} satisfies RouterContext,
		defaultPreload: "intent",
		defaultStaleTime: 0,
		dehydrate: () =>
			({
				queries: dehydrate(queryClient),
			}) as unknown as ReturnType<
				NonNullable<Parameters<typeof createTanstackRouter>[0]["dehydrate"]>
			>,
		hydrate: (state) =>
			hydrate(queryClient, state.queries as unknown as DehydratedState),
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
		server: {
			requestContext: { env?: D1Env; ctx?: unknown };
		};
	}
}
