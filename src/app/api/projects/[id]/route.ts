import db from "@/db";
import { projectEditSchema, projects } from "@/db/schema";
import {
  getDeletionRoute,
  getEditionRoute,
  getQueryRouteWithId,
} from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
  async (id) =>
    await db.query.projects.findFirst({ where: eq(projects.id, id) }),
  (id) => `Project with id '${id}' does not exist`
);

export const DELETE = getDeletionRoute(
  async (id) => await db.delete(projects).where(eq(projects.id, id))
);

export const PATCH = getEditionRoute((id, body) => {
  const parsedBody = projectEditSchema.parse(body);
  const last_modified = new Date().toISOString();
  return db
    .update(projects)
    .set({ ...parsedBody, id, last_modified })
    .where(eq(projects.id, id));
});
