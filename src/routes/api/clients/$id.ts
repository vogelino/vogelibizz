import { createFileRoute } from "@tanstack/react-router";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/clients/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(async (id) => {
				const { getClient } = await import("@/server/api/clients/getClient");
				return getClient(id);
			}),
			PATCH: getEditionRoute(async (id, body) => {
				const [
					{ clientEditSchema, clients, projectsToClients },
					{ default: db },
					{ eq },
				] = await Promise.all([
					import("@/db/schema"),
					import("@/db"),
					import("drizzle-orm"),
				]);
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
				const [{ clients, projectsToClients }, { default: db }, { eq }] =
					await Promise.all([
						import("@/db/schema"),
						import("@/db"),
						import("drizzle-orm"),
					]);
				await db
					.delete(projectsToClients)
					.where(eq(projectsToClients.clientId, id));
				await db.delete(clients).where(eq(clients.id, id));
			}),
		},
	},
});
