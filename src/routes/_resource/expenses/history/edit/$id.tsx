import { createFileRoute, Outlet, useChildMatches } from "@tanstack/react-router";

import ExpenseHistoryPage from "@/features/expenses/ExpenseHistoryPage";
import {
  expenseHistoryTransactionQueryOptions,
  expensesQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

import { ExpenseHistoryEditOverlay } from "./$id/modal";

export const Route = createFileRoute("/_resource/expenses/history/edit/$id")({
  loader: async ({ context, params }) => {
    const id = parseId(params.id);
    const [detail] = await Promise.all([
      context.queryClient.ensureQueryData(expenseHistoryTransactionQueryOptions(id)),
      context.queryClient.ensureQueryData(expensesQueryOptions()),
    ]);
    return { detail };
  },
  component: ExpenseHistoryTransactionEditRoute,
});

function ExpenseHistoryTransactionEditRoute() {
  const childMatches = useChildMatches();
  const { id } = Route.useParams();
  const { detail } = Route.useLoaderData();
  if (childMatches.length > 0) return <Outlet />;
  return (
    <>
      <ExpenseHistoryPage />
      <ExpenseHistoryEditOverlay id={id} month={detail.month} />
    </>
  );
}
