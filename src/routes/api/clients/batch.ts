import { createFileRoute } from "@tanstack/react-router";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import db from "@/db";
import { clientEditSchema, clients, projectsToClients } from "@/db/schema";
import { json } from "@/utility/apiUtil";

const idsSchema = z.array(z.int().positive()).min(1).max(1_000);
const editSchema = z.object({
	items: z.array(clientEditSchema).min(1).max(1_000),
});
const deleteSchema = z.object({ ids: idsSchema });
type BatchStatement = Parameters<typeof db.batch>[0][number];

async function authorize(request: Request) {
	return isAuthenticatedAndAdmin(undefined, request);
}

export const Route = createFileRoute("/api/clients/batch")({
	server: {
		handlers: {
			PATCH: async ({ request }) => {
				if (!(await authorize(request)))
					return json({ error: "Unauthorized" }, { status: 401 });
				try {
					const { items } = editSchema.parse(await request.json());
					const statements: BatchStatement[] = [];
					for (const item of items) {
						const { id, projects, ...changes } = item;
						statements.push(
							db
								.update(clients)
								.set(changes)
								.where(inArray(clients.id, [id])),
						);
						if (projects) {
							statements.push(
								db
									.delete(projectsToClients)
									.where(inArray(projectsToClients.clientId, [id])),
							);
							if (projects.length)
								statements.push(
									db.insert(projectsToClients).values(
										projects.map(({ id: projectId }) => ({
											clientId: id,
											projectId,
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
						{ error: "Clients could not be updated." },
						{ status: 500 },
					);
				}
			},
			DELETE: async ({ request }) => {
				if (!(await authorize(request)))
					return json({ error: "Unauthorized" }, { status: 401 });
				try {
					const { ids } = deleteSchema.parse(await request.json());
					await db.batch([
						db
							.delete(projectsToClients)
							.where(inArray(projectsToClients.clientId, ids)),
						db.delete(clients).where(inArray(clients.id, ids)),
					]);
					return json({ ids });
				} catch (error) {
					if (error instanceof z.ZodError)
						return json({ error: error.issues[0]?.message }, { status: 400 });
					return json(
						{ error: "Clients could not be deleted." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
