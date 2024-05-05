import db from "@/db";
import { projects } from "@/db/schema";
import { getRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getRouteWithId(
  async (id) =>
    await db.query.projects.findFirst({ where: eq(projects.id, id) }),
  (id) => `Project with id '${id}' does not exist`
);
