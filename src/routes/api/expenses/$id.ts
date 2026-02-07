import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getExpense } from "@/server/api/expenses/getExpense";
import db from "@/db";
import { expenseEditSchema, expenses } from "@/db/schema";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/expenses/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(getExpense),
			PATCH: getEditionRoute(async (id, body) => {
				const parsedBody = expenseEditSchema.parse(body);
				await db.update(expenses).set(parsedBody).where(eq(expenses.id, id));
			}),
			DELETE: getDeletionRoute(async (id) => {
				await db.delete(expenses).where(eq(expenses.id, id));
			}),
		},
	},
});
