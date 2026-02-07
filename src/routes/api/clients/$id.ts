import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getClient } from "@/app/api/clients/[id]/getClient";
import db from "@/db";
import { clientEditSchema, clients, projectsToClients } from "@/db/schema";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/clients/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(getClient),
			PATCH: getEditionRoute(async (id, body) => {
				const parsedBody = clientEditSchema.parse({ ...(body as object), id });
				const { projects, ...client } = parsedBody;
				await db.update(clients).set(client).where(eq(clients.id, id));
				if (projects) {
					await db
						.delete(projectsToClients)
						.where(eq(projectsToClients.clientId, id));
					await db.insert(projectsToClients).values(
						projects.map((project) => ({
							projectId: project.id,
							clientId: id,
						})),
					);
				}
			}),
			DELETE: getDeletionRoute(async (id) => {
				await db
					.delete(projectsToClients)
					.where(eq(projectsToClients.clientId, id));
				await db.delete(clients).where(eq(clients.id, id));
			}),
		},
	},
});
