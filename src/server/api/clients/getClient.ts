import { eq } from "drizzle-orm";
import db from "@/db";
import {
	type ClientType,
	clients,
	projects,
	projectsToClients,
} from "@/db/schema";

export async function getClient(id: number): Promise<ClientType> {
	const clientsWithProjects = await db
		.select()
		.from(clients)
		.leftJoin(projectsToClients, eq(clients.id, projectsToClients.clientId))
		.leftJoin(projects, eq(projectsToClients.projectId, projects.id))
		.where(eq(clients.id, id));

	const clientsMap = new Map<
		number,
		ClientType & {
			projects: { id: number; name: string }[];
		}
	>([]);

	for (const row of clientsWithProjects) {
		const existingClient = clientsMap.get(row.clients.id);
		const clientProjects = existingClient?.projects ?? [];
		if (existingClient) clientsMap.delete(row.clients.id);
		clientsMap.set(row.clients.id, {
			...row.clients,
			projects: [
				...clientProjects,
				...(row.projects === null ? [] : [row.projects]),
			],
		});
	}

	const client = clientsMap.get(id);
	if (!client) {
		throw new Error(`Client with id '${id}' does not exist`);
	}

	return client;
}
