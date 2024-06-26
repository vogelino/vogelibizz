import TableRelationsList from "@/components/TableRelationsList";
import InternalLink from "@/components/ui/internal-link";
import type { ClientType, ProjectType } from "@/db/schema";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ClientType>();
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ColumnsType<T> = ColumnDef<T, any>;

export const clientTableColumns: ColumnsType<ClientType>[] = [
	columnHelper.accessor("id", {
		size: 50,
		minSize: 50,
		maxSize: 50,
		header: () => (
			<span className="text-xs font-mono text-grayDark group-hover:text-inherit">
				ID
			</span>
		),
		cell: function render({ getValue }) {
			return (
				<span className="text-xs font-mono text-grayDark">
					{getValue<string>()}
				</span>
			);
		},
	}),
	columnHelper.accessor("name", {
		size: 1000,
		header: "Name",
		cell: function render({ getValue, row }) {
			const id = row.original.id;
			const value = getValue<string>();
			return <InternalLink href={`/clients/edit/${id}`}>{value}</InternalLink>;
		},
	}),
	columnHelper.accessor("projects", {
		size: 300,
		header: "Projects",
		cell: function render({ row, getValue }) {
			const id = row.original.id;
			const items = getValue<ProjectType[]>();
			return (
				<TableRelationsList
					originalId={id}
					items={items}
					relationResource="projects"
					originalResource="clients"
				/>
			);
		},
	}),
];
