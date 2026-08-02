import { createFileRoute } from "@tanstack/react-router";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import db from "@/db";
import { expenseEditSchema, expenses } from "@/db/schema";
import { json } from "@/utility/apiUtil";

const idsSchema = z.array(z.int().positive()).min(1).max(1_000);
const editSchema = z.object({
	items: z.array(expenseEditSchema).min(1).max(1_000),
});
type BatchStatement = Parameters<typeof db.batch>[0][number];

export const Route = createFileRoute("/api/expenses/batch")({
	server: {
		handlers: {
			PATCH: async ({ request }) => {
				if (!(await isAuthenticatedAndAdmin(undefined, request)))
					return json({ error: "Unauthorized" }, { status: 401 });
				try {
					const { items } = editSchema.parse(await request.json());
					const statements = items.map(({ id, ...changes }) =>
						db
							.update(expenses)
							.set(changes)
							.where(inArray(expenses.id, [id])),
					) as unknown as [BatchStatement, ...BatchStatement[]];
					await db.batch(statements);
					return json({ ids: items.map(({ id }) => id) });
				} catch (error) {
					if (error instanceof z.ZodError)
						return json({ error: error.issues[0]?.message }, { status: 400 });
					return json(
						{ error: "Expenses could not be updated." },
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
						db.delete(expenses).where(inArray(expenses.id, ids)),
					]);
					return json({ ids });
				} catch (error) {
					if (error instanceof z.ZodError)
						return json({ error: error.issues[0]?.message }, { status: 400 });
					return json(
						{ error: "Expenses could not be deleted." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
