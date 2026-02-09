import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/settings")({
	server: {
		handlers: {
			GET: async () => {
				const { getSettings } = await import("@/server/api/settings/getSettings");
				return json(await getSettings());
			},
			PUT: async ({ request }) => {
				const [
					{ isAuthenticatedAndAdmin },
					{ z },
					{ currencyEnum, settings },
					{ eq },
					{ default: db },
					{ getSettings },
				] = await Promise.all([
					import("@/auth"),
					import("zod"),
					import("@/db/schema"),
					import("drizzle-orm"),
					import("@/db"),
					import("@/server/api/settings/getSettings"),
				]);
				const updateSettingsSchema = z.object({
					targetCurrency: z.enum(currencyEnum.enumValues),
				});
				const allowed = await isAuthenticatedAndAdmin(undefined, request);
				if (!allowed) return json({ error: "Unauthorized" }, { status: 401 });
				const body = await request.json();
				const parsed = updateSettingsSchema.parse(body);
				const current = await getSettings();
				const [updated] = await db
					.update(settings)
					.set({ targetCurrency: parsed.targetCurrency })
					.where(eq(settings.id, current.id))
					.returning();
				return json(updated);
			},
		},
	},
});
