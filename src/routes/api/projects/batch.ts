import { createFileRoute } from "@tanstack/react-router";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import db from "@/db";
import { projectEditSchema, projects, projectsToClients } from "@/db/schema";
import { json } from "@/utility/apiUtil";

const idsSchema = z.array(z.int().positive()).min(1).max(1_000);
const editSchema = z.object({
	items: z.array(projectEditSchema).min(1).max(1_000),
});
type BatchStatement = Parameters<typeof db.batch>[0][number];

export const Route = createFileRoute("/api/projects/batch")({
	server: {
		handlers: {
			PATCH: async ({ request }) => {
				if (!(await isAuthenticatedAndAdmin(undefined, request)))
					return json({ error: "Unauthorized" }, { status: 401 });
				try {
					const { items } = editSchema.parse(await request.json());
					const statements: BatchStatement[] = [];
					for (const item of items) {
						const { id, clients, ...changes } = item;
						statements.push(
							db
								.update(projects)
								.set(changes)
								.where(inArray(projects.id, [id])),
						);
						if (clients) {
							statements.push(
								db
									.delete(projectsToClients)
									.where(inArray(projectsToClients.projectId, [id])),
							);
							if (clients.length)
								statements.push(
									db.insert(projectsToClients).values(
										clients.map(({ id: clientId }) => ({
											projectId: id,
											clientId,
										})),
									),
								);
						}
					}
					await db.batch(statements as [BatchStatement, ...BatchStatement[]]);
					return json({ ids: items.map(({ id }) => id) });
				} catch (error) {
					if (error instanceof z.ZodError)
						return json({ error: error.issues[0]?.message }, { status: 400 });
					return json(
						{ error: "Projects could not be updated." },
						{ status: 500 },
					);
				}
			},
			DELETE: async ({ request }) => {
				if (!(await isAuthenticatedAndAdmin(undefined, request)))
					return json({ error: "Unauthorized" }, { status: 401 });
				try {
					const { ids } = z
						.object({ ids: idsSchema })
						.parse(await request.json());
					await db.batch([
						db
							.delete(projectsToClients)
							.where(inArray(projectsToClients.projectId, ids)),
						db.delete(projects).where(inArray(projects.id, ids)),
					]);
					return json({ ids });
				} catch (error) {
					if (error instanceof z.ZodError)
						return json({ error: error.issues[0]?.message }, { status: 400 });
					return json(
						{ error: "Projects could not be deleted." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
