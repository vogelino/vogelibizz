import db from "@/db";
import { expenses } from "@/db/schema";
import { getMutationRouteWithId, getQueryRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
  async (id) =>
    await db.query.expenses.findFirst({ where: eq(expenses.id, id) }),
  (id) => `Project with id '${id}' does not exist`
);

export const DELETE = getMutationRouteWithId(
  async (id) => await db.delete(expenses).where(eq(expenses.id, id))
);
