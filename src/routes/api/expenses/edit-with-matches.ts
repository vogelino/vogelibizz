import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import { editExpenseWithMatchesSchema } from "@/utility/expenseMatchSuggestions";

export const Route = createFileRoute("/api/expenses/edit-with-matches")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (!(await isAuthenticatedAndAdmin(undefined, request))) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}
				try {
					const input = editExpenseWithMatchesSchema.parse(
						await request.json(),
					);
					const { editExpenseWithMatches } = await import(
						"@/server/expenseHistory/expenseMatches"
					);
					return json(await editExpenseWithMatches(input));
				} catch (error) {
					if (error instanceof z.ZodError || error instanceof SyntaxError) {
						return json({ error: "Invalid expense details." }, { status: 400 });
					}
					const { ExpenseMatchConflictError } = await import(
						"@/server/expenseHistory/expenseMatches"
					);
					if (error instanceof ExpenseMatchConflictError) {
						return json({ error: error.message }, { status: 409 });
					}
					return json(
						{ error: "Expense could not be saved." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
