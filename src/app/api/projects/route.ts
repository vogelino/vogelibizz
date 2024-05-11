import { auth } from "@/auth";
import db from "@/db";
import { projectInsertSchema, projects } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
  return NextResponse.json(await db.query.projects.findMany());
});

export const POST = getCreationRoute(async (body) => {
  const parsedBody = projectInsertSchema.array().parse(body);
  return NextResponse.json(await db.insert(projects).values(parsedBody));
});
