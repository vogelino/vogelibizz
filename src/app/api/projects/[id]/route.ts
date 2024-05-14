import db from "@/db";
import { projectEditSchema, projects, projectsToClients } from "@/db/schema";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";
import { parseId } from "@/utility/resourceUtil";
import { eq } from "drizzle-orm";
import { getProject } from "./getProject";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
	async (id) => await getProject(parseId(id)),
	(id) => `Project with id '${id}' does not exist`,
);

export const DELETE = getDeletionRoute(
	async (id) => await db.delete(projects).where(eq(projects.id, id)),
);

export const PATCH = getEditionRoute(async (id, body) => {
	const { clients, ...parsedBody } = projectEditSchema.parse(body);
	await db
		.update(projects)
		.set({
			...parsedBody,
			id: parseId(id),
			last_modified: new Date().toISOString(),
		})
		.where(eq(projects.id, parseId(id)));
	const clientsRelations = (clients || []).map(async (client) => {
		await db
			.delete(projectsToClients)
			.where(eq(projectsToClients.projectId, parseId(id)));
		await db.insert(projectsToClients).values([
			{
				projectId: parseId(id),
				clientId: client.id,
			},
		]);
	});
	await Promise.all([...clientsRelations]);
});
