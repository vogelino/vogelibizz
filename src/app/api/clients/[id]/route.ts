import db from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = async ({ params }: { params: { id: string } }) => {
  return NextResponse.json(
    await db.query.clients.findFirst({
      where: eq(clients.id, +params.id),
    })
  );
};
