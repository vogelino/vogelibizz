import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { IconBadge } from "@/components/ui/icon-badge";
import { InlineInput, InlineMultiCombobox } from "@/components/ui/inline-edit";
import type { ClientType, ProjectType } from "@/db/schema";

const columnHelper = createColumnHelper<ClientType>();
// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
type ColumnsType<T> = ColumnDef<T, any>;

export function getClientTableColumns(
	onEdit: (client: ClientType, change: Partial<ClientType>) => void,
	projects: readonly ProjectType[],
	relationsLoading = false,
): ColumnsType<ClientType>[] {
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
		columnHelper.accessor("projects", {
			size: 300,
			header: "Projects",
			cell: function render({ row, getValue }) {
				const items = getValue<ProjectType[]>();
				return (
					<InlineMultiCombobox
						aria-label={`projects for ${row.original.name}`}
						loading={relationsLoading}
						options={projects.map((project) => ({
							value: String(project.id),
							label: project.name,
						}))}
						values={items.map((project) => String(project.id))}
						placeholder="No projects"
						selectedValueFormater={(value) => (
							<IconBadge
								icon={null}
								label={
									projects.find(
										(project) => String(project.id) === String(value),
									)?.name
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
									.map(({ id, name }) => ({ id, name })),
							})
						}
					/>
				);
			},
		}),
	];
}
