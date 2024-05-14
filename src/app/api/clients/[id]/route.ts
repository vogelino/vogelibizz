import db from "@/db";
import { clientEditSchema, clients, projectsToClients } from "@/db/schema";
import {
  getDeletionRoute,
  getEditionRoute,
  getQueryRouteWithId,
} from "@/utility/apiUtil";
import { parseId } from "@/utility/resourceUtil";
import { eq } from "drizzle-orm";
import { getClient } from "./getClient";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
  (id) => getClient(parseId(id)),
  (id) => `Client with id '${id}' does not exist`
);

export const DELETE = getDeletionRoute((id) =>
  db.delete(clients).where(eq(clients.id, parseId(id)))
);

export const PATCH = getEditionRoute(async (id, body) => {
  const { projects, ...parsedBody } = clientEditSchema.parse(body);
  await db
    .update(clients)
    .set({
      ...parsedBody,
      id: parseId(id),
      last_modified: new Date().toISOString(),
    })
    .where(eq(clients.id, parseId(id)));
  const projectsRelations = (projects || []).map(async (project) => {
    await db
      .delete(projectsToClients)
      .where(eq(projectsToClients.clientId, parseId(id)));
    await db.insert(projectsToClients).values([
      {
        clientId: parseId(id),
        projectId: project.id,
      },
    ]);
  });
  await Promise.all([...projectsRelations]);
});
