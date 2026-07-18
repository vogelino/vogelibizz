import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import {
	expenseHistoryCreateExpenseSchema,
	expenseHistoryTransactionMutationSchema,
} from "@/utility/expenseHistoryContracts";
import {
	createAndAssociateExpense,
	deleteExpenseHistoryTransaction,
	deleteExpenseHistoryTransactions,
	ExpenseHistoryConflictError,
	ExpenseHistoryNotFoundError,
	mutateExpenseHistoryTransaction,
} from "./mutateExpenseHistory";

type Dependencies = {
	authorize: (request: Request) => Promise<boolean>;
	mutate: typeof mutateExpenseHistoryTransaction;
	createAndAssociate: typeof createAndAssociateExpense;
	delete: typeof deleteExpenseHistoryTransaction;
};

export function createExpenseHistoryMutationHandlers(
	dependencies: Dependencies = {
		authorize: (request) => isAuthenticatedAndAdmin(undefined, request),
		mutate: mutateExpenseHistoryTransaction,
		createAndAssociate: createAndAssociateExpense,
		delete: deleteExpenseHistoryTransaction,
	},
) {
	const handle =
		(kind: "mutate" | "create" | "delete") =>
		async (request: Request, idParam: string) => {
			if (!(await dependencies.authorize(request)))
				return json({ error: "Unauthorized" }, { status: 401 });
			const id = z.coerce.number().int().positive().safeParse(idParam);
			if (!id.success)
				return json({ error: "Invalid transaction id." }, { status: 400 });
			try {
				const result =
					kind === "delete"
						? await dependencies.delete(id.data)
						: kind === "mutate"
							? await dependencies.mutate(
									id.data,
									expenseHistoryTransactionMutationSchema.parse(
										await request.json(),
									),
								)
							: await dependencies.createAndAssociate(
									id.data,
									expenseHistoryCreateExpenseSchema.parse(await request.json()),
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
	return {
		patch: handle("mutate"),
		createExpense: handle("create"),
		delete: handle("delete"),
	};
}

const handlers = createExpenseHistoryMutationHandlers();
export const patchExpenseHistoryTransactionHandler = handlers.patch;
export const createExpenseFromTransactionHandler = handlers.createExpense;
export const deleteExpenseHistoryTransactionHandler = handlers.delete;

const batchDeleteSchema = z
	.object({
		ids: z.array(z.number().int().positive()).min(1).max(1_000),
	})
	.strict()
	.refine(({ ids }) => new Set(ids).size === ids.length, {
		message: "Transaction ids must be unique.",
		path: ["ids"],
	});

export function createExpenseHistoryBatchDeleteHandler(
	dependencies: {
		authorize: (request: Request) => Promise<boolean>;
		deleteMany: typeof deleteExpenseHistoryTransactions;
	} = {
		authorize: (request) => isAuthenticatedAndAdmin(undefined, request),
		deleteMany: deleteExpenseHistoryTransactions,
	},
) {
	return async (request: Request) => {
		if (!(await dependencies.authorize(request))) {
			return json({ error: "Unauthorized" }, { status: 401 });
		}
		try {
			const { ids } = batchDeleteSchema.parse(await request.json());
			return json(await dependencies.deleteMany(ids));
		} catch (error) {
			if (error instanceof SyntaxError) {
				return json(
					{ error: "Request body must be valid JSON." },
					{ status: 400 },
				);
			}
			if (error instanceof z.ZodError) {
				return json(
					{ error: error.issues[0]?.message ?? "Invalid body." },
					{ status: 400 },
				);
			}
			return json(
				{ error: "Transactions could not be deleted." },
				{ status: 500 },
			);
		}
	};
}

export const batchDeleteExpenseHistoryTransactionsHandler =
	createExpenseHistoryBatchDeleteHandler();
