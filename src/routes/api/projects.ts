import { createFileRoute } from "@tanstack/react-router";
import db from "@/db";
import { projectInsertSchema, projects, projectsToClients } from "@/db/schema";
import { getProjects } from "@/server/api/projects/getProjects";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/projects")({
	server: {
		handlers: {
			GET: async () => json(await getProjects()),
			POST: async ({ request }) => {
				const body = await request.json();
				const parsedBody = projectInsertSchema.array().parse(body);
				const promises = parsedBody.map(async ({ clients, ...project }) => {
					const dbProject = await db
						.insert(projects)
						.values([project])
						.returning();
					if (!clients) return dbProject[0].id;
					await db.insert(projectsToClients).values(
						clients.map((client) => ({
							clientId: client.id,
							projectId: dbProject[0].id,
						})),
					);
					return dbProject[0].id;
				});
				const ids = await Promise.all(promises);
				return json(ids);
			},
		},
	},
});
