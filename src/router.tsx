import type { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
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
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
