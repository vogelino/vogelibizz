"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import PageDataTable from "@/components/PageDataTable";
import type { InvoiceType } from "@/db/schema";
import {
	amountSearchText,
	filterRowsByText,
} from "@/features/search/searchEngine";
import useClients from "@/utility/data/useClients";
import useInvoiceEdit from "@/utility/data/useInvoiceEdit";
import useInvoices from "@/utility/data/useInvoices";
import useProjects from "@/utility/data/useProjects";
import { useUrlSearchState } from "@/utility/useUrlSearchState";
import { getInvoiceTableColumns } from "./columns";
import { InvoiceFilter, type InvoiceFilterState } from "./InvoiceFilter";
import { getInvoiceHours, getInvoiceTotal } from "./invoiceTotals";

const invoiceFilterDefaults: InvoiceFilterState = {
	clientIds: [],
	projectIds: [],
	currencies: [],
};

export default function InvoicesList({
	loading = false,
}: {
	loading?: boolean;
}) {
	const { data = [], error, isPending } = useInvoices();
	const search = useSearch({ from: "/_resource/invoices" });
	const navigate = useNavigate({ from: "/invoices" });
	const updateSearch = useCallback(
		(nextSearch: typeof search) =>
			navigate({ search: nextSearch, replace: true }),
		[navigate],
	);
	const [filters, setFilters] = useUrlSearchState(
		search,
		invoiceFilterDefaults,
		updateSearch,
	);
	const { data: clients = [], isPending: clientsPending } = useClients();
	const { data: projects = [], isPending: projectsPending } = useProjects();
	const editMutation = useInvoiceEdit();
	const isLoading = loading || isPending;
	const editInvoice = useCallback(
		(invoice: InvoiceType, change: Partial<InvoiceType>) => {
			editMutation.mutate({ id: invoice.id, ...change });
		},
		[editMutation],
	);
	const columns = useMemo(
		() =>
			getInvoiceTableColumns(
				editInvoice,
				clients,
				projects,
				clientsPending || projectsPending,
			),
		[clients, clientsPending, editInvoice, projects, projectsPending],
	);
	const visibleData = useMemo(
		() =>
			filterRowsByText(
				data,
				search.q,
				(invoice) => invoice.id,
				(invoice) =>
					[
						invoice.id,
						invoice.name,
						invoice.invoiceNumber,
						invoice.subject,
						invoice.currency,
						amountSearchText(getInvoiceTotal(invoice), invoice.currency),
						amountSearchText(invoice.hourlyRate, invoice.currency),
						getInvoiceHours(invoice),
						invoice.clients?.map(({ name }) => name).join(" "),
						invoice.projects?.map(({ name }) => name).join(" "),
						invoice.rows.map(({ description }) => description).join(" "),
						invoice.rows
							.map(({ hoursCount }) =>
								amountSearchText(
									hoursCount * invoice.hourlyRate,
									invoice.currency,
								),
							)
							.join(" "),
					]
						.filter(Boolean)
						.join(" "),
			),
		[data, search.q],
	);
	const filteredData = useMemo(() => {
		const selectedClientIds = new Set(filters.clientIds);
		const selectedProjectIds = new Set(filters.projectIds);
		const selectedCurrencies = new Set(filters.currencies);
		return visibleData.filter(
			(invoice) =>
				(!selectedClientIds.size ||
					(invoice.clientId !== null &&
						selectedClientIds.has(String(invoice.clientId)))) &&
				(!selectedProjectIds.size ||
					invoice.projects?.some((project) =>
						selectedProjectIds.has(String(project.id)),
					)) &&
				(!selectedCurrencies.size || selectedCurrencies.has(invoice.currency)),
		);
	}, [filters, visibleData]);

	return (
		<PageDataTable<InvoiceType>
			resource="invoices"
			columns={columns}
			data={!error && filteredData.length > 0 ? filteredData : []}
			defaultSortColumn="last_modified"
			loading={isLoading}
			toolbarSkeleton={
				<div className="px-6 pt-3 md:px-10">
					<InvoiceFilter loading clients={[]} projects={[]} />
				</div>
			}
			toolbar={() => (
				<div className="sticky left-0 flex flex-wrap items-center gap-4 px-6 pt-3 md:px-10">
					<InvoiceFilter
						loading={false}
						clients={clients}
						projects={projects}
						filters={filters}
						onFiltersChange={setFilters}
					/>
				</div>
			)}
		/>
	);
}
