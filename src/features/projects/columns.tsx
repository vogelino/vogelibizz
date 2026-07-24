import { createColumnHelper } from "@tanstack/react-table";
import { IconBadge } from "@/components/ui/icon-badge";
import {
	InlineCombobox,
	InlineInput,
	InlineMultiCombobox,
} from "@/components/ui/inline-edit";
import type { ClientType, ProjectType } from "@/db/schema";
import {
	mapStatusToIcon,
	mapStatusToLabel,
	type StatusType,
	statusList,
} from "@/utility/statusUtil";

const columnHelper = createColumnHelper<ProjectType>();

export function getProjectTableColumns(
	onEdit: (project: ProjectType, change: Partial<ProjectType>) => void,
	clients: readonly ClientType[],
	relationsLoading = false,
) {
	return [
		columnHelper.accessor("id", {
			size: 50,
			minSize: 50,
			maxSize: 50,
			header: () => (
				<span className="text-muted-foreground group-hover:text-inherit">
					ID
				</span>
			),
			cell: function render({ getValue }) {
				return (
					<span className="text-muted-foreground">{getValue<string>()}</span>
				);
			},
		}),
		columnHelper.accessor("name", {
			size: 1000,
			header: "Name",
			cell: function render({ getValue, row }) {
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
		columnHelper.accessor("status", {
			size: 100,
			header: "Status",
			cell: function render({ getValue, row }) {
				const value = getValue<StatusType>();
				return (
					<InlineCombobox
						value={value}
						aria-label={`status for ${row.original.name}`}
						align="start"
						options={statusList.map((option) => ({
							...option,
							label: (
								<IconBadge
									icon={mapStatusToIcon(option.value)}
									label={option.label}
								/>
							),
							searchValue: option.label,
						}))}
						selectedValueFormater={(status) => (
							<IconBadge
								icon={mapStatusToIcon(status)}
								label={mapStatusToLabel(status)}
							/>
						)}
						onChange={(status) => onEdit(row.original, { status })}
					/>
				);
			},
		}),
		columnHelper.accessor("clients", {
			size: 300,
			header: "Clients",
			cell: function render({ row, getValue }) {
				const items = getValue<ClientType[]>();
				return (
					<InlineMultiCombobox
						aria-label={`clients for ${row.original.name}`}
						loading={relationsLoading}
						options={clients.map((client) => ({
							value: String(client.id),
							label: client.name,
						}))}
						values={items.map((client) => String(client.id))}
						placeholder="No clients"
						selectedValueFormater={(value) => (
							<IconBadge
								icon={null}
								label={
									clients.find((client) => String(client.id) === String(value))
										?.name
								}
								className="m-0 max-w-36"
							/>
						)}
						onChange={(selected) =>
							onEdit(row.original, {
								clients: selected
									.map((option) =>
										clients.find(
											(client) => String(client.id) === String(option.value),
										),
									)
									.filter((client): client is ClientType => Boolean(client))
									.map(({ id, name }) => ({ id, name })),
							})
						}
					/>
				);
			},
		}),
	];
}
