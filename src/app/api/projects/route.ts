import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db";
import { projectInsertSchema, projects, projectsToClients } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { getProjects } from "./getProjects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const GET = auth(async () => {
	return NextResponse.json(await getProjects());
});

export const POST = getCreationRoute(async (body) => {
	const parsedBody = projectInsertSchema.array().parse(body);
	const promises = parsedBody.map(async ({ clients, ...project }) => {
		const dbProject = await db.insert(projects).values([project]).returning();
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

	return NextResponse.json(ids);
});
