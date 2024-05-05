import db from "@/db";
import { clientSelectSchema, clients } from "@/db/schema";
import { getMutationRouteWithId, getQueryRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
  (id) => db.query.clients.findFirst({ where: eq(clients.id, id) }),
  (id) => `Client with id '${id}' does not exist`
);

export const DELETE = getMutationRouteWithId((id) =>
  db.delete(clients).where(eq(clients.id, id))
);

export const PATCH = getMutationRouteWithId(
  (id, body) => db.update(clients).set(body).where(eq(clients.id, id)),
  clientSelectSchema
);
