import { createFileRoute } from "@tanstack/react-router";
import db from "@/db";
import { expenseInsertSchema, expenses } from "@/db/schema";
import { getExpenses } from "@/server/api/expenses/getExpenses";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/expenses")({
	server: {
		handlers: {
			GET: async () => json(await getExpenses()),
			POST: async ({ request }) => {
				const body = await request.json();
				const parsedBody = expenseInsertSchema.array().parse(body);
				const inserted = await db
					.insert(expenses)
					.values(parsedBody)
					.returning();
				return json(inserted);
			},
		},
	},
});
