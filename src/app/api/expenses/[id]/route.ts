import db from "@/db";
import { expenseSelectSchema, expenses } from "@/db/schema";
import { getMutationRouteWithId, getQueryRouteWithId } from "@/utility/apiUtil";
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

export const DELETE = getMutationRouteWithId(
	async (id) => await db.delete(expenses).where(eq(expenses.id, id)),
);

export const PATCH = getMutationRouteWithId(
	(id, body) => db.update(expenses).set(body).where(eq(expenses.id, id)),
	expenseSelectSchema,
);
