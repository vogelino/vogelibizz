import { eq } from "drizzle-orm";
import db from "@/db";
import { clientEditSchema, clients, projectsToClients } from "@/db/schema";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";
import { getClient } from "./getClient";

export const dynamic = "force-dynamic";
export const GET = getQueryRouteWithId(
	(id) => getClient(id),
	(id) => `Client with id '${id}' does not exist`,
);

export const DELETE = getDeletionRoute((id) =>
	db.delete(clients).where(eq(clients.id, id)),
);

export const PATCH = getEditionRoute(async (id, body) => {
	const { projects, ...parsedBody } = clientEditSchema.parse(body);
	await db
		.update(clients)
		.set({
			...parsedBody,
			id,
			last_modified: new Date().toISOString(),
		})
		.where(eq(clients.id, id));
	const projectsRelations = (projects || []).map(async (project) => {
		await db
			.delete(projectsToClients)
			.where(eq(projectsToClients.clientId, id));
		await db.insert(projectsToClients).values([
			{
				clientId: id,
				projectId: project.id,
			},
		]);
	});
	await Promise.all([...projectsRelations]);
});
