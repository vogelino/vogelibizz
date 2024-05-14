import db from "@/db";
import {
	type ProjectType,
	clients,
	projects,
	projectsToClients,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProject(id: number): Promise<ProjectType> {
	const projectsWithClients = await db
		.select()
		.from(projects)
		.leftJoin(projectsToClients, eq(projects.id, projectsToClients.projectId))
		.leftJoin(clients, eq(projectsToClients.clientId, clients.id))
		.where(eq(projects.id, id));

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

	const project = projectsMap.get(id);
	if (!project) {
		throw new Error(`Project with id '${id}' does not exist`);
	}

	return project;
}
