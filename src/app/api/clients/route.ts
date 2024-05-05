import { auth } from "@/auth";
import db from "@/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
  return NextResponse.json(await db.query.clients.findMany());
});
