import { z } from "zod";
import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import {
	expenseHistoryImportCommitRequestSchema,
	expenseHistoryImportRequestSchema,
} from "@/utility/expenseHistoryImportContracts";
import { BankImportValidationError } from "./bankImportParser";
import {
	commitExpenseHistoryImport,
	ExpenseHistoryReplacementRequiredError,
	previewExpenseHistoryImport,
} from "./importExpenseHistory";

export function importErrorResponse(error: unknown) {
	if (error instanceof ExpenseHistoryReplacementRequiredError) {
		return json(
			{ error: error.message, code: error.code, months: error.months },
			{ status: 409 },
		);
	}
	if (error instanceof BankImportValidationError) {
		return json({ error: error.message, code: error.code }, { status: 400 });
	}
	if (error instanceof z.ZodError) {
		return json(
			{
				error: error.issues.map((issue) => issue.message).join("; "),
				code: "INVALID_IMPORT_REQUEST",
			},
			{ status: 400 },
		);
	}
	return json(
		{ error: "The expense history import could not be completed." },
		{ status: 500 },
	);
}

type ImportHttpDependencies = {
	authorize: (request: Request) => Promise<boolean>;
	preview: typeof previewExpenseHistoryImport;
	commit: typeof commitExpenseHistoryImport;
};

export function createExpenseHistoryImportHandlers(
	dependencies: ImportHttpDependencies = {
		authorize: (request) => isAuthenticatedAndAdmin(undefined, request),
		preview: previewExpenseHistoryImport,
		commit: commitExpenseHistoryImport,
	},
) {
	return {
		preview: async (request: Request) => {
			if (!(await dependencies.authorize(request))) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			try {
				const body = expenseHistoryImportRequestSchema.parse(
					await request.json(),
				);
				return json(await dependencies.preview(body));
			} catch (error) {
				return importErrorResponse(error);
			}
		},
		commit: async (request: Request) => {
			if (!(await dependencies.authorize(request))) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}
			try {
				const body = expenseHistoryImportCommitRequestSchema.parse(
					await request.json(),
				);
				return json(await dependencies.commit(body));
			} catch (error) {
				return importErrorResponse(error);
			}
		},
	};
}

const importHandlers = createExpenseHistoryImportHandlers();
export const previewExpenseHistoryImportHandler = importHandlers.preview;
export const commitExpenseHistoryImportHandler = importHandlers.commit;
