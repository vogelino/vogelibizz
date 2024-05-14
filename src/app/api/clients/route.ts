import { auth } from "@/auth";
import db from "@/db";
import { clientInsertSchema, clients } from "@/db/schema";
import { getCreationRoute } from "@/utility/apiUtil";
import { NextResponse } from "next/server";
import { projectsToClients } from "./../../../db/schema/projectsToClientsDbSchema";
import { getClients } from "./getClients";

export const dynamic = "force-dynamic";
export const GET = auth(async () => {
	const clients = await getClients();
	return NextResponse.json(clients);
});

export const POST = getCreationRoute(async (body) => {
	const parsedClients = clientInsertSchema.array().parse(body);

	const promises = parsedClients.map(async ({ projects, ...client }) => {
		const dbClient = await db.insert(clients).values([client]).returning();
		if (!projects) return dbClient[0].id;
		await db.insert(projectsToClients).values(
			projects.map((project) => ({
				clientId: dbClient[0].id,
				projectId: project.id,
			})),
		);
		return dbClient[0].id;
	});
	const ids = await Promise.all(promises);

	return NextResponse.json(ids);
});
