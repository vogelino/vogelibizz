import { ArrowLeftToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { IconBadge } from "@/components/ui/icon-badge";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import {
	type ClientType,
	currencyEnum,
	type InvoiceType,
	type ProjectType,
} from "@/db/schema";

type InvoiceCurrency = InvoiceType["currency"];

export type InvoiceFilterState = {
	clientIds: string[];
	projectIds: string[];
	currencies: InvoiceCurrency[];
};

type InvoiceFilterProps =
	| {
			loading: true;
			clients: readonly ClientType[];
			projects: readonly ProjectType[];
			filters?: never;
			onFiltersChange?: never;
	  }
	| {
			loading: false;
			clients: readonly ClientType[];
			projects: readonly ProjectType[];
			filters: InvoiceFilterState;
			onFiltersChange: (filters: InvoiceFilterState) => void;
	  };

function RelationBadge({ label }: { label?: string }) {
	return <IconBadge icon={null} label={label} />;
}

export function InvoiceFilter(props: InvoiceFilterProps) {
	const clientIds = props.loading ? [] : props.filters.clientIds;
	const projectIds = props.loading ? [] : props.filters.projectIds;
	const currencies = props.loading ? [] : props.filters.currencies;
	const hasFilters =
		clientIds.length > 0 || projectIds.length > 0 || currencies.length > 0;

	return (
		<FilterBar active={hasFilters}>
			<MultiValueInput<string>
				options={props.clients.map((client) => ({
					value: String(client.id),
					label: client.name,
				}))}
				values={clientIds}
				placeholder="Filter by client"
				aria-label="Filter invoices by client"
				selectedValueFormater={(value) => (
					<RelationBadge
						label={
							props.clients.find(
								(client) => String(client.id) === String(value),
							)?.name
						}
					/>
				)}
				onChange={
					props.loading
						? undefined
						: (options) =>
								props.onFiltersChange({
									...props.filters,
									clientIds: options.map((option) => String(option.value)),
								})
				}
				loading={props.loading}
				className="min-w-64 max-w-full"
			/>

			<MultiValueInput<string>
				options={props.projects.map((project) => ({
					value: String(project.id),
					label: project.name,
				}))}
				values={projectIds}
				placeholder="Filter by project"
				aria-label="Filter invoices by project"
				selectedValueFormater={(value) => (
					<RelationBadge
						label={
							props.projects.find(
								(project) => String(project.id) === String(value),
							)?.name
						}
					/>
				)}
				onChange={
					props.loading
						? undefined
						: (options) =>
								props.onFiltersChange({
									...props.filters,
									projectIds: options.map((option) => String(option.value)),
								})
				}
				loading={props.loading}
				className="min-w-64 max-w-full"
			/>

			<MultiValueInput<InvoiceCurrency>
				options={currencyEnum.enumValues.map((currency) => ({
					value: currency,
					label: currency,
				}))}
				values={currencies}
				placeholder="Filter by currency"
				aria-label="Filter invoices by currency"
				selectedValueFormater={(value) => (
					<RelationBadge label={String(value)} />
				)}
				onChange={
					props.loading
						? undefined
						: (options) =>
								props.onFiltersChange({
									...props.filters,
									currencies: options.map(
										(option) => option.value as InvoiceCurrency,
									),
								})
				}
				loading={props.loading}
				className="min-w-48 max-w-full"
			/>

			{!props.loading && hasFilters ? (
				<Button
					variant="ghost"
					className="h-9"
					onClick={() =>
						props.onFiltersChange({
							clientIds: [],
							projectIds: [],
							currencies: [],
						})
					}
				>
					<ArrowLeftToLine size={20} />
					Clear filters
				</Button>
			) : null}
		</FilterBar>
	);
}
