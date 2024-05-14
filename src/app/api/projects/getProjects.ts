import db from "@/db";
import {
	type ProjectType,
	clients,
	projects,
	projectsToClients,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProjects(): Promise<ProjectType[]> {
	const projectsWithClients = await db
		.select()
		.from(projects)
		.leftJoin(projectsToClients, eq(projects.id, projectsToClients.projectId))
		.leftJoin(clients, eq(projectsToClients.clientId, clients.id));

	const projectsMap = new Map<
		number,
		ProjectType & {
			clients: { id: number; name: string }[];
		}
	>([]);

	for (const row of projectsWithClients) {
		const existingProject = projectsMap.get(row.projects.id);
		const projectClients = existingProject?.clients ?? [];
		if (existingProject) projectsMap.delete(row.projects.id);
		projectsMap.set(row.projects.id, {
			...row.projects,
			clients: [
				...projectClients,
				...(row.clients === null ? [] : [row.clients]),
			],
		});
	}

	return Array.from(projectsMap.values());
}
