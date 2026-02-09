import { createFileRoute } from "@tanstack/react-router";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/expenses/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(async (id) => {
				const { getExpense } = await import(
					"@/server/api/expenses/getExpense"
				);
				return getExpense(id);
			}),
			PATCH: getEditionRoute(async (id, body) => {
				const [{ expenseEditSchema, expenses }, { default: db }, { eq }] =
					await Promise.all([
						import("@/db/schema"),
						import("@/db"),
						import("drizzle-orm"),
					]);
				const parsedBody = expenseEditSchema.parse(body);
				await db.update(expenses).set(parsedBody).where(eq(expenses.id, id));
			}),
			DELETE: getDeletionRoute(async (id) => {
				const [{ expenses }, { default: db }, { eq }] = await Promise.all([
					import("@/db/schema"),
					import("@/db"),
					import("drizzle-orm"),
				]);
				await db.delete(expenses).where(eq(expenses.id, id));
			}),
		},
	},
});
