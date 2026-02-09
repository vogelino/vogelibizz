import { createFileRoute } from "@tanstack/react-router";
import { json } from "@/utility/apiUtil";

export const Route = createFileRoute("/api/clients")({
	server: {
		handlers: {
			GET: async () => {
				const { getClients } = await import("@/server/api/clients/getClients");
				return json(await getClients());
			},
			POST: async ({ request }) => {
				const body = await request.json();
				const [
					{ clientInsertSchema, clients, projectsToClients },
					{ default: db },
				] = await Promise.all([import("@/db/schema"), import("@/db")]);
				const parsedBody = clientInsertSchema.array().parse(body);
				if (parsedBody.length === 0) {
					return json(
						{ error: "At least one client is required." },
						{ status: 400 },
					);
				}
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
