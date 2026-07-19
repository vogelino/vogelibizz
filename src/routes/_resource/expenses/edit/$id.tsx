import {
	createFileRoute,
	Link,
	Outlet,
	useChildMatches,
} from "@tanstack/react-router";
import { SaveIcon } from "lucide-react";
import ExpenseEdit from "@/components/ExpenseEdit";
import FormPageLayout from "@/components/FormPageLayout";
import { Button } from "@/components/ui/button";
import { expenseQueryOptions } from "@/utility/data/queryOptions";
import { parseId } from "@/utility/resourceUtil";

export const Route = createFileRoute("/_resource/expenses/edit/$id")({
	loader: async ({ context, params }) => {
		const parsedId = parseId(params.id);
		if (import.meta.env.SSR) {
			const expense = await context.queryClient.ensureQueryData(
				expenseQueryOptions(parsedId),
			);
			return { expense };
		}
		void context.queryClient.prefetchQuery(expenseQueryOptions(parsedId));
		return {};
	},
	component: ExpenseEditPageRoute,
});

function ExpenseEditPageRoute() {
	const childMatches = useChildMatches();
	const { id } = Route.useParams();
	const { expense } = Route.useLoaderData();
	if (childMatches.length > 0) return <Outlet />;
	const parsedId = parseId(id);
	if (!parsedId) return null;

	return (
		<FormPageLayout
			id={parsedId}
			title="Edit expense"
			allLink="/expenses"
			footerButtons={
				<>
					<Button asChild variant="outline">
						<Link to="/expenses" search>
							<span>{"Cancel"}</span>
						</Link>
					</Button>
					<Button type="submit" form={`expense-edit-form-${parsedId}`}>
						<SaveIcon />
						{"Save expense"}
					</Button>
				</>
			}
		>
			<ExpenseEdit
				id={parsedId}
				formId={`expense-edit-form-${parsedId}`}
				initialData={expense}
			/>
		</FormPageLayout>
	);
}
