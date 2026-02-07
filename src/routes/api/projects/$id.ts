import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getProject } from "@/app/api/projects/[id]/getProject";
import db from "@/db";
import { projectEditSchema, projects, projectsToClients } from "@/db/schema";
import {
	getDeletionRoute,
	getEditionRoute,
	getQueryRouteWithId,
} from "@/utility/apiUtil";

export const Route = createFileRoute("/api/projects/$id")({
	server: {
		handlers: {
			GET: getQueryRouteWithId(getProject),
			PATCH: getEditionRoute(async (id, body) => {
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
				await db
					.delete(projectsToClients)
					.where(eq(projectsToClients.projectId, id));
				await db.delete(projects).where(eq(projects.id, id));
			}),
		},
	},
});
