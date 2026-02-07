import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/pdf")({
	server: {
		handlers: {
			GET: async () => json({ ok: true }),
		},
	},
});
