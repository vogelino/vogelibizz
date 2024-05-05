import { isAuthenticatedAndAdmin } from "@/auth";
import db from "@/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = async () => {
  if (!(await isAuthenticatedAndAdmin()))
    return NextResponse.redirect("/login");
  const data = await db.query.expenses.findMany();
  return NextResponse.json(data);
};
