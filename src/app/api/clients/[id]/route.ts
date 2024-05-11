import db from "@/db";
import { clientEditSchema, clients } from "@/db/schema";
import {
  getDeletionRoute,
  getEditionRoute,
  getQueryRouteWithId,
} from "@/utility/apiUtil";
import { parseId } from "@/utility/resourceUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
  (id) => db.query.clients.findFirst({ where: eq(clients.id, parseId(id)) }),
  (id) => `Client with id '${id}' does not exist`
);

export const DELETE = getDeletionRoute((id) =>
  db.delete(clients).where(eq(clients.id, parseId(id)))
);

export const PATCH = getEditionRoute((id, body) => {
  const parsedBody = clientEditSchema.parse(body);
  return db
    .update(clients)
    .set({
      ...parsedBody,
      id: parseId(id),
      last_modified: new Date().toISOString(),
    })
    .where(eq(clients.id, parseId(id)));
});
