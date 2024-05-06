import { auth } from "@/auth";
import db from "@/db";
import { expenseInsertSchema, expenses } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { getExpensesWithMonthlyClpPrice } from "@/utility/expenseFetchUtil";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
  console.log("GET /api/expenses");
  try {
    const json = await getExpenses();
    return NextResponse.json(json);
  } catch (error) {
    console.log(`Error retrieving expenses: ${error}`);
    return NextResponse.json(
      { error: "Error retrieving expenses" },
      { status: 500 }
    );
  }
});

export async function getExpenses() {
  const expenses = await db.query.expenses.findMany();
  console.log(`Retrieved ${expenses.length} expenses from db`);
  const expensesWithMonthlyCLPPrice = await getExpensesWithMonthlyClpPrice(
    expenses
  );
  console.log(
    `Retrieved ${expensesWithMonthlyCLPPrice.length} expenses with monthly CLP price`
  );
  return expensesWithMonthlyCLPPrice;
}

export const POST = getCreationRoute(async (body) => {
  return NextResponse.json(await db.insert(expenses).values(body));
}, z.array(expenseInsertSchema));
