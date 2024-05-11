import db from "@/db";
import { expenseEditSchema, expenses } from "@/db/schema";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";
import { parseId } from "@/utility/resourceUtil";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getExpense } from "./getExpense";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
	async (id) => {
		try {
			const expense = await getExpense(id);
			return NextResponse.json(expense);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			return NextResponse.json({ error: err.message }, { status: 404 });
		}
	},
	(id) => `Project with id '${id}' does not exist`,
);

export const DELETE = getDeletionRoute(
	async (id) => await db.delete(expenses).where(eq(expenses.id, parseId(id))),
);

export const PATCH = getEditionRoute((id, body) => {
	const parsedBody = expenseEditSchema.parse(body);
	return db
		.update(expenses)
		.set({
			...parsedBody,
			id: parseId(id),
			last_modified: new Date().toISOString(),
		})
		.where(eq(expenses.id, parseId(id)));
});
