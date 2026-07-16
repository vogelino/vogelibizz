import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import {
	expenseHistoryCreateExpenseSchema,
	expenseHistoryTransactionMutationSchema,
} from "@/utility/expenseHistoryContracts";
import {
	createAndAssociateExpense,
	ExpenseHistoryConflictError,
	ExpenseHistoryNotFoundError,
	mutateExpenseHistoryTransaction,
} from "./mutateExpenseHistory";

type Dependencies = {
	authorize: (request: Request) => Promise<boolean>;
	mutate: typeof mutateExpenseHistoryTransaction;
	createAndAssociate: typeof createAndAssociateExpense;
};

export function createExpenseHistoryMutationHandlers(
	dependencies: Dependencies = {
		authorize: (request) => isAuthenticatedAndAdmin(undefined, request),
		mutate: mutateExpenseHistoryTransaction,
		createAndAssociate: createAndAssociateExpense,
	},
) {
	const handle =
		(kind: "mutate" | "create") =>
		async (request: Request, idParam: string) => {
			if (!(await dependencies.authorize(request)))
				return json({ error: "Unauthorized" }, { status: 401 });
			const id = z.coerce.number().int().positive().safeParse(idParam);
			if (!id.success)
				return json({ error: "Invalid transaction id." }, { status: 400 });
			try {
				const body = await request.json();
				const result =
					kind === "mutate"
						? await dependencies.mutate(
								id.data,
								expenseHistoryTransactionMutationSchema.parse(body),
							)
						: await dependencies.createAndAssociate(
								id.data,
								expenseHistoryCreateExpenseSchema.parse(body),
							);
				return json(result);
			} catch (error) {
				if (error instanceof SyntaxError)
					return json(
						{ error: "Request body must be valid JSON." },
						{ status: 400 },
					);
				if (error instanceof z.ZodError)
					return json(
						{ error: error.issues[0]?.message ?? "Invalid body." },
						{ status: 400 },
					);
				if (error instanceof ExpenseHistoryConflictError)
					return json(
						{ error: error.message, code: "CONFLICT" },
						{ status: 409 },
					);
				if (error instanceof ExpenseHistoryNotFoundError)
					return json({ error: error.message }, { status: 404 });
				return json({ error: "Transaction mutation failed." }, { status: 500 });
			}
		};
	return { patch: handle("mutate"), createExpense: handle("create") };
}

const handlers = createExpenseHistoryMutationHandlers();
export const patchExpenseHistoryTransactionHandler = handlers.patch;
export const createExpenseFromTransactionHandler = handlers.createExpense;
