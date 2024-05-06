import db from "@/db";
import { expenseSelectSchema, expenses } from "@/db/schema";
import { getMutationRouteWithId, getQueryRouteWithId } from "@/utility/apiUtil";
import { getExpensesWithMonthlyClpPrice } from "@/utility/expenseFetchUtil";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
  (id) => `Project with id '${id}' does not exist`
);

export async function getExpense(id: number) {
  const expense = await db.query.expenses.findFirst({
    where: eq(expenses.id, id),
  });
  if (!expense) throw new Error(`Project with id '${id}' does not exist`);
  const [expenseWithMonthlyCLPPrice] =
    (await getExpensesWithMonthlyClpPrice([expense])) ?? [];
  if (!expenseWithMonthlyCLPPrice)
    throw new Error(`Project with id '${id}' does not exist`);
  return expenseWithMonthlyCLPPrice;
}

export const DELETE = getMutationRouteWithId(
  async (id) => await db.delete(expenses).where(eq(expenses.id, id))
);

export const PATCH = getMutationRouteWithId(
  (id, body) => db.update(expenses).set(body).where(eq(expenses.id, id)),
  expenseSelectSchema
);
