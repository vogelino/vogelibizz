import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";

import ExpenseEdit from "@/components/ExpenseEdit";
import PageHeaderTitle from "@/components/PageHeaderTitle";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import ExpensesPage from "@/features/expenses/ExpensesPage";
import {
  expenseOverviewSummaryQueryOptions,
  expenseQueryOptions,
  expensesQueryOptions,
} from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/edit/$id/modal")({
  loader: async ({ context, params }) => {
    const parsedId = parseId(params.id);
    await Promise.all([
      context.queryClient.prefetchQuery(expenseQueryOptions(parsedId)),
      context.queryClient.ensureQueryData(expensesQueryOptions()),
      context.queryClient.ensureQueryData(expenseOverviewSummaryQueryOptions()),
    ]);
  },
  component: ExpenseEditModal,
});

function ExpenseEditModal() {
  const { id } = Route.useParams();
  return <ExpenseEditOverlay id={id} />;
}

export function ExpenseEditOverlay({
  id,
  expense,
}: {
  id: string;
  expense?: Parameters<typeof ExpenseEdit>[0]["initialData"];
}) {
  const navigate = useNavigate();
  const parsedId = parseId(id);
  if (!parsedId) return <ExpensesPage />;
  const formId = `expense-edit-form-${parsedId}`;

  return (
    <>
      <ExpensesPage />
      <ResponsiveModal
        open
        title={<PageHeaderTitle name="Edit expense" id={parsedId} />}
        onClose={() => navigate({ to: "/expenses", search: true })}
        footer={
          <>
            <Button asChild variant="outline">
              <button type="button" onClick={() => navigate({ to: "/expenses", search: true })}>
                Cancel
              </button>
            </Button>
            <Button type="submit" form={formId}>
              <SaveIcon />
              {"Save expense"}
            </Button>
          </>
        }
      >
        <ExpenseEdit id={parsedId} formId={formId} initialData={expense} />
      </ResponsiveModal>
    </>
  );
}
