import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import { expenseHistoryTransactionMutationSchema } from "@/utility/expenseHistoryContracts";

const batchEditSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.int().positive(),
				change: expenseHistoryTransactionMutationSchema,
			}),
		)
		.min(1)
		.max(1_000),
});

export const Route = createFileRoute("/api/expense-history/transactions/batch")(
	{
		server: {
			handlers: {
				PATCH: async ({ request }) => {
					if (!(await isAuthenticatedAndAdmin(undefined, request)))
						return json({ error: "Unauthorized" }, { status: 401 });
					try {
						const input = batchEditSchema.parse(await request.json());
						const { mutateExpenseHistoryTransactions } = await import(
							"@/server/expenseHistory/mutateExpenseHistory"
						);
						return json(await mutateExpenseHistoryTransactions(input.items));
					} catch (error) {
						if (error instanceof z.ZodError)
							return json({ error: error.issues[0]?.message }, { status: 400 });
						return json(
							{ error: "Transactions could not be updated." },
							{ status: 500 },
						);
					}
				},
				DELETE: async ({ request }) => {
					const { batchDeleteExpenseHistoryTransactionsHandler } = await import(
						"@/server/expenseHistory/mutateHttp"
					);
					return batchDeleteExpenseHistoryTransactionsHandler(request);
				},
			},
		},
	},
);
