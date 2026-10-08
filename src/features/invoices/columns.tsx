import { createColumnHelper } from "@tanstack/react-table";
import { IconBadge } from "@/components/ui/icon-badge";
import {
	InlineCombobox,
	InlineDatePickerInput,
	InlineInput,
	InlineMultiCombobox,
} from "@/components/ui/inline-edit";
import type { ClientType, InvoiceType, ProjectType } from "@/db/schema";
import { formatCurrency, locale } from "@/utility/formatUtil";
import { getInvoiceHours, getInvoiceTotal } from "./invoiceTotals";

const columnHelper = createColumnHelper<InvoiceType>();

function formatDate(date: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(date));
}

export function getInvoiceTableColumns(
	onEdit: (invoice: InvoiceType, change: Partial<InvoiceType>) => void,
	clients: readonly ClientType[],
	projects: readonly ProjectType[],
	relationsLoading = false,
) {
	return [
		columnHelper.accessor("date", {
			size: 130,
			header: "Date",
			cell: ({ getValue, row }) => {
				const value = getValue<string>();
				return (
					<InlineDatePickerInput
						value={value.slice(0, 10)}
						displayValue={formatDate(value)}
						ariaLabel={`date for ${row.original.name}`}
						displayClassName="text-muted-foreground text-nowrap"
						onCommit={(date) => onEdit(row.original, { date })}
					/>
				);
			},
		}),
		columnHelper.accessor("name", {
			size: 250,
			header: "Name",
			cell: ({ getValue, row }) => {
				const value = getValue<string>();
				return (
					<InlineInput
						value={value}
						ariaLabel={`name for ${value}`}
						onCommit={(name) => onEdit(row.original, { name })}
						className="h-10"
						displayClassName="h-10 text-base"
						inputClassName="h-10"
					/>
				);
			},
		}),
		columnHelper.accessor("invoiceNumber", {
			size: 120,
			header: "Invoice #",
			cell: ({ getValue, row }) => (
				<InlineInput
					type="number"
					min={1}
					step={1}
					value={getValue()}
					ariaLabel={`invoice number for ${row.original.name}`}
					onCommit={(invoiceNumber) => onEdit(row.original, { invoiceNumber })}
				/>
			),
		}),
		columnHelper.accessor((row) => row.clients?.[0]?.name ?? "", {
			id: "client",
			size: 240,
			header: "Client",
			cell: ({ row }) => (
				<InlineCombobox
					value={row.original.clientId}
					aria-label={`client for ${row.original.name}`}
					align="start"
					loading={relationsLoading}
					options={[
						{ value: null, label: "—", searchValue: "No client" },
						...clients.map((client) => ({
							value: client.id as number | null,
							label: client.name,
							searchValue: client.name,
						})),
					]}
					selectedValueFormater={(clientId) =>
						clients.find((client) => client.id === clientId)?.name ?? "—"
					}
					onChange={(clientId) => onEdit(row.original, { clientId })}
				/>
			),
		}),
		columnHelper.accessor((row) => row.projects?.[0]?.name ?? "", {
			id: "project",
			size: 260,
			header: "Project",
			cell: ({ row }) => (
				<InlineMultiCombobox
					aria-label={`projects for ${row.original.name}`}
					loading={relationsLoading}
					options={projects.map((project) => ({
						value: String(project.id),
						label: project.name,
					}))}
					values={(row.original.projects ?? []).map((project) =>
						String(project.id),
					)}
					placeholder="No projects"
					selectedValueFormater={(value) => (
						<IconBadge
							icon={null}
							label={
								projects.find((project) => String(project.id) === String(value))
									?.name
							}
							className="m-0 max-w-36"
						/>
					)}
					onChange={(selected) =>
						onEdit(row.original, {
							projects: selected
								.map((option) =>
									projects.find(
										(project) => String(project.id) === String(option.value),
									),
								)
								.filter((project): project is ProjectType => Boolean(project))
								.map(({ id, name, hourlyRate }) => ({
									id,
									name,
									hourlyRate,
								})),
						})
					}
				/>
			),
		}),
		columnHelper.accessor(getInvoiceHours, {
			id: "hours",
			size: 100,
			header: "Hours",
			cell: ({ getValue }) => <span>{getValue()}</span>,
		}),
		columnHelper.accessor(getInvoiceTotal, {
			id: "total",
			size: 140,
			header: "Total",
			cell: ({ getValue, row }) => (
				<span>{formatCurrency(getValue(), row.original.currency)}</span>
			),
		}),
	];
}
