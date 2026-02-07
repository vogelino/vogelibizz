import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/db";
import { currencyEnum, settings } from "@/db/schema";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import { getSettings } from "@/server/api/settings/getSettings";

const updateSettingsSchema = z.object({
	targetCurrency: z.enum(currencyEnum.enumValues),
});

export const Route = createFileRoute("/api/settings")({
	server: {
		handlers: {
			GET: async () => json(await getSettings()),
			PUT: async ({ request }) => {
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
