import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/projects")({
	server: {
		handlers: {
			GET: async () => {
				const { getProjects } = await import("@/server/api/projects/getProjects");
				return json(await getProjects());
			},
			POST: async ({ request }) => {
				const body = await request.json();
				const [
					{ projectInsertSchema, projects, projectsToClients },
					{ default: db },
				] = await Promise.all([import("@/db/schema"), import("@/db")]);
				const parsedBody = projectInsertSchema.array().parse(body);
				if (parsedBody.length === 0) {
					return json(
						{ error: "At least one project is required." },
						{ status: 400 },
					);
				}
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
