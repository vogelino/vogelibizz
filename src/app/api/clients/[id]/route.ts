import db from "@/db";
import { clients } from "@/db/schema";
import { getMutationRouteWithId, getQueryRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
  async (id) => await db.query.clients.findFirst({ where: eq(clients.id, id) }),
  (id) => `Project with id '${id}' does not exist`
);

export const DELETE = getMutationRouteWithId(
  async (id) => await db.delete(clients).where(eq(clients.id, id))
);
