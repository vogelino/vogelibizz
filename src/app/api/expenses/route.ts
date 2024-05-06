import { auth } from "@/auth";
import db from "@/db";
import { expenseInsertSchema, expenses } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
  return NextResponse.json(await db.query.expenses.findMany());
});

export const POST = getCreationRoute(async (body) => {
  return NextResponse.json(await db.insert(expenses).values(body));
}, z.array(expenseInsertSchema));
