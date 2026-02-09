import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { StartAuthJS } = await import("start-authjs");
				const { authConfig } = await import("@/utils/auth");
				const { GET } = StartAuthJS(authConfig);
				return GET({ request, response: new Response() });
			},
			POST: async ({ request }) => {
				const { StartAuthJS } = await import("start-authjs");
				const { authConfig } = await import("@/utils/auth");
				const { POST } = StartAuthJS(authConfig);
				return POST({ request, response: new Response() });
			},
		},
	},
});
