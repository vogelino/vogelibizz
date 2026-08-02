import { ArrowLeftToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { MultiValueInput } from "@/components/ui/multi-value-input";
import type { ClientType } from "@/db/schema";
import {
	mapStatusToColorClass,
	mapStatusToIcon,
	mapStatusToLabel,
	type StatusType,
	statusList,
} from "@/utility/statusUtil";

export type ProjectFilterState = {
	statuses: StatusType[];
	clientIds: string[];
};

type ProjectFilterProps =
	| {
			loading: true;
			clients: readonly ClientType[];
			filters?: never;
			onFiltersChange?: never;
	  }
	| {
			loading: false;
			clients: readonly ClientType[];
			filters: ProjectFilterState;
			onFiltersChange: (filters: ProjectFilterState) => void;
	  };

function StatusBadge({ status }: { status: StatusType }) {
	return (
		<IconBadge
			icon={mapStatusToIcon(status)}
			label={mapStatusToLabel(status)}
			className={mapStatusToColorClass(status)}
		/>
	);
}

export function ProjectFilter(props: ProjectFilterProps) {
	const statuses = props.loading ? [] : props.filters.statuses;
	const clientIds = props.loading ? [] : props.filters.clientIds;
	const hasFilters = statuses.length > 0 || clientIds.length > 0;

	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
			<MultiValueInput<StatusType>
				options={statusList.map((status) => ({
					value: status.value,
					label: <StatusBadge status={status.value} />,
				}))}
				values={statuses}
				placeholder="Filter by status"
				aria-label="Filter projects by status"
				selectedValueFormater={(value) => (
					<StatusBadge status={value as StatusType} />
				)}
				onChange={
					props.loading
						? undefined
						: (options) =>
								props.onFiltersChange({
									...props.filters,
									statuses: options.map((option) => option.value as StatusType),
								})
				}
				loading={props.loading}
				className="min-w-64 max-w-full"
			/>

			<MultiValueInput<string>
				options={props.clients.map((client) => ({
					value: String(client.id),
					label: client.name,
				}))}
				values={clientIds}
				placeholder="Filter by client"
				aria-label="Filter projects by client"
				selectedValueFormater={(value) => (
					<IconBadge
						icon={null}
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

			{!props.loading && hasFilters ? (
				<Button
					variant="ghost"
					className="h-9"
					onClick={() => props.onFiltersChange({ statuses: [], clientIds: [] })}
				>
					<ArrowLeftToLine size={20} />
					Clear filters
				</Button>
			) : null}
		</div>
	);
}
