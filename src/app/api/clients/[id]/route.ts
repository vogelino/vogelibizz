import db from "@/db";
import { clients } from "@/db/schema";
import { getRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getRouteWithId(
  async (id) => await db.query.clients.findFirst({ where: eq(clients.id, id) }),
  (id) => `Project with id '${id}' does not exist`
);
