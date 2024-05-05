import db from "@/db";
import { expenses } from "@/db/schema";
import { getRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getRouteWithId(
  async (id) =>
    await db.query.expenses.findFirst({ where: eq(expenses.id, id) }),
  (id) => `Project with id '${id}' does not exist`
);
