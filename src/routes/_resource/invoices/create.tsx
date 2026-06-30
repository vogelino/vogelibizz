import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { type InvoiceInsertType, invoiceInsertSchema } from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import {
	invoiceQueryOptions,
	invoicesQueryOptions,
} from "@/utility/data/queryOptions";
import useInvoices from "@/utility/data/useInvoices";

export const Route = createFileRoute("/_resource/invoices/create")({
	loader: async ({ context }) => {
		if (import.meta.env.SSR) {
			const { getInvoices } = await import(
				"@/server/api/invoices/getInvoices.js"
			);
			const invoices = await getInvoices();
			context.queryClient.setQueryData(
				invoicesQueryOptions().queryKey,
				invoices,
			);
			return { invoices };
		}
		void context.queryClient.prefetchQuery(invoicesQueryOptions());
		return {};
	},
	component: InvoiceCreateRoute,
});

const createInvoice = createQueryFunction<number[], InvoiceInsertType[]>({
	resourceName: "invoices",
	action: "create",
	inputZodSchema: invoiceInsertSchema.array(),
});

function InvoiceCreateRoute() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const startedRef = useRef(false);
	const invoicesQuery = useInvoices();
	const createMutation = useMutation({
		mutationKey: ["invoices", "create", "auto"],
		mutationFn: createInvoice,
		onSuccess: async (ids) => {
			const createdId = ids[0];
			if (typeof createdId !== "number") {
				throw new Error("Invoice creation did not return an id.");
			}
			await queryClient.invalidateQueries({
				queryKey: invoicesQueryOptions().queryKey,
			});
			await queryClient.prefetchQuery(invoiceQueryOptions(createdId));
			navigate({ to: "/invoices/$id", params: { id: String(createdId) } });
		},
	});

	useEffect(() => {
		if (startedRef.current) return;
		if (invoicesQuery.isPending) return;
		startedRef.current = true;
		const nextInvoiceNumber =
			(invoicesQuery.data ?? []).reduce(
				(maxValue, invoice) => Math.max(maxValue, invoice.invoiceNumber),
				0,
			) + 1;
		const name = `Invoice ${nextInvoiceNumber}`;
		createMutation.mutate([
			{
				name,
				subject: name,
				invoiceNumber: nextInvoiceNumber,
				date: new Date().toISOString().slice(0, 10),
				rows: [],
			},
		]);
	}, [createMutation, invoicesQuery.data, invoicesQuery.isPending]);

	if (createMutation.isError) {
		return (
			<div className="px-6 py-10 md:px-10">
				<div className="mx-auto flex max-w-xl flex-col gap-4 rounded-md border border-border bg-card p-6">
					<h2 className="text-lg font-semibold">Could not create invoice</h2>
					<p className="text-sm text-muted-foreground">
						{String(createMutation.error)}
					</p>
					<div className="flex gap-2">
						<Button
							type="button"
							onClick={() => {
								startedRef.current = false;
								createMutation.reset();
							}}
						>
							Try again
						</Button>
						<Button asChild variant="outline">
							<Link to="/invoices">Back to invoices</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="px-6 py-10 md:px-10">
			<div className="mx-auto flex max-w-xl items-center gap-3 rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
				<LoaderCircleIcon className="size-4 animate-spin" />
				Creating invoice...
			</div>
		</div>
	);
}
