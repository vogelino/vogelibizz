import { createFileRoute } from "@tanstack/react-router";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/projects/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(async (id) => {
				const { getProject } = await import("@/server/api/projects/getProject");
				return getProject(id);
			}),
			PATCH: getEditionRoute(async (id, body) => {
				const [
					{ projectEditSchema, projects, projectsToClients },
					{ default: db },
					{ eq },
				] = await Promise.all([
					import("@/db/schema"),
					import("@/db"),
					import("drizzle-orm"),
				]);
				const parsedBody = projectEditSchema.parse({ ...(body as object), id });
				const { clients, ...project } = parsedBody;
				await db.update(projects).set(project).where(eq(projects.id, id));
				if (clients) {
					await db
						.delete(projectsToClients)
						.where(eq(projectsToClients.projectId, id));
					await db.insert(projectsToClients).values(
						clients.map((client) => ({
							clientId: client.id,
							projectId: id,
						})),
					);
				}
			}),
			DELETE: getDeletionRoute(async (id) => {
				const [{ projects, projectsToClients }, { default: db }, { eq }] =
					await Promise.all([
						import("@/db/schema"),
						import("@/db"),
						import("drizzle-orm"),
					]);
				await db
					.delete(projectsToClients)
					.where(eq(projectsToClients.projectId, id));
				await db.delete(projects).where(eq(projects.id, id));
			}),
		},
	},
});
