import db from "@/db";
import { projectSelectSchema, projects } from "@/db/schema";
import { getMutationRouteWithId, getQueryRouteWithId } from "@/utility/apiUtil";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
	async (id) =>
		await db.query.projects.findFirst({ where: eq(projects.id, id) }),
	(id) => `Project with id '${id}' does not exist`,
);

export const DELETE = getMutationRouteWithId(
	async (id) => await db.delete(projects).where(eq(projects.id, id)),
);

export const PATCH = getMutationRouteWithId(
	(id, body) => db.update(projects).set(body).where(eq(projects.id, id)),
	projectSelectSchema,
);
