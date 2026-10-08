import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { isAuthenticatedAndAdmin } from "@/auth";
import { json } from "@/utility/apiUtil";
import { expenseMatchRequestSchema } from "@/utility/expenseMatchSuggestions";

export const Route = createFileRoute("/api/expenses/matches")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isAuthenticatedAndAdmin(undefined, request))) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const input = expenseMatchRequestSchema.parse(await request.json());
          const { getExpenseMatchSuggestions } =
            await import("@/server/expenseHistory/expenseMatches");
          return json(await getExpenseMatchSuggestions(input));
        } catch (error) {
          if (error instanceof z.ZodError || error instanceof SyntaxError) {
            return json({ error: "Invalid expense details." }, { status: 400 });
          }
          return json({ error: "Matches could not be loaded." }, { status: 500 });
        }
      },
    },
  },
});
