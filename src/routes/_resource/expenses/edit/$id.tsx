import { createFileRoute, Outlet, useChildMatches } from "@tanstack/react-router";

import {
  expenseOverviewSummaryQueryOptions,
  expenseQueryOptions,
  expensesQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

import { ExpenseEditOverlay } from "../edit.$id.modal";

export const Route = createFileRoute("/_resource/expenses/edit/$id")({
  loader: async ({ context, params }) => {
    const parsedId = parseId(params.id);
    const [expense] = await Promise.all([
      context.queryClient.ensureQueryData(expenseQueryOptions(parsedId)),
      context.queryClient.ensureQueryData(expensesQueryOptions()),
      context.queryClient.ensureQueryData(expenseOverviewSummaryQueryOptions()),
    ]);
    return { expense };
  },
  component: ExpenseEditPageRoute,
});

function ExpenseEditPageRoute() {
  const childMatches = useChildMatches();
  const { id } = Route.useParams();
  const data = Route.useLoaderData();
  if (childMatches.length > 0) return <Outlet />;
  return <ExpenseEditOverlay id={id} expense={data.expense} />;
}
