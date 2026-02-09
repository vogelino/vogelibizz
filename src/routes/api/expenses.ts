import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/expenses")({
	server: {
		handlers: {
			GET: async () => {
				const { getExpenses } = await import(
					"@/server/api/expenses/getExpenses"
				);
				return json(await getExpenses());
			},
			POST: async ({ request }) => {
				const body = await request.json();
				const [{ expenseInsertSchema, expenses }, { default: db }] =
					await Promise.all([import("@/db/schema"), import("@/db")]);
				const parsedBody = expenseInsertSchema.array().parse(body);
				if (parsedBody.length === 0) {
					return json(
						{ error: "At least one expense is required." },
						{ status: 400 },
					);
				}
				const inserted = await db
					.insert(expenses)
					.values(parsedBody)
					.returning();
				return json(inserted);
			},
		},
	},
});
