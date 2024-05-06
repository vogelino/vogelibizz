import { auth } from "@/auth";
import db from "@/db";
import { clientInsertSchema, clients } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
  return NextResponse.json(await db.query.clients.findMany());
});

export const POST = getCreationRoute(async (body) => {
  return NextResponse.json(await db.insert(clients).values(body));
}, z.array(clientInsertSchema));
