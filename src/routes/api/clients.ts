import { createFileRoute } from "@tanstack/react-router";
import { getClients } from "@/server/api/clients/getClients";
import db from "@/db";
import { clientInsertSchema, clients, projectsToClients } from "@/db/schema";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/clients")({
	server: {
		handlers: {
			GET: async () => json(await getClients()),
			POST: async ({ request }) => {
				const body = await request.json();
				const parsedBody = clientInsertSchema.array().parse(body);
				const promises = parsedBody.map(async ({ projects, ...client }) => {
					const dbClient = await db
						.insert(clients)
						.values([client])
						.returning();
					if (!projects) return dbClient[0].id;
					await db.insert(projectsToClients).values(
						projects.map((project) => ({
							projectId: project.id,
							clientId: dbClient[0].id,
						})),
					);
					return dbClient[0].id;
				});
				const ids = await Promise.all(promises);
				return json(ids);
			},
		},
	},
});
