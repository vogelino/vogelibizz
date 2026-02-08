import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import TableRelationsList from "@/components/TableRelationsList";
import InternalLink from "@/components/ui/internal-link";
import {
	type ClientType,
	clientSelectSchema,
	type ProjectType,
} from "@/db/schema";
import createQueryFunction from "@/utility/data/createQueryFunction";
import { queryKeys } from "@/utility/queryKeys";

const columnHelper = createColumnHelper<ClientType>();
// biome-ignore lint/suspicious/noExplicitAny: tanstack column typing
type ColumnsType<T> = ColumnDef<T, any>;

export const clientTableColumns: ColumnsType<ClientType>[] = [
	columnHelper.accessor("id", {
		size: 50,
		minSize: 50,
		maxSize: 50,
		header: () => (
			<span className="text-muted-foreground group-hover:text-inherit">ID</span>
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
			const id = row.original.id;
			const value = getValue<string>();
			return (
				<InternalLink
					to="/clients/edit/$id/modal"
					params={{ id: String(id) }}
					className="text-base -ml-3 bg-transparent"
					mask={{
						to: "/clients/edit/$id",
						params: { id: String(id) },
						unmaskOnReload: true,
					}}
					prefetchQuery={{
						queryKey: queryKeys.clients.detail(id).queryKey,
						queryFn: createQueryFunction<ClientType>({
							resourceName: "clients",
							action: "querySingle",
							outputZodSchema: clientSelectSchema,
							id,
						}),
					}}
				>
					{value}
				</InternalLink>
			);
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
					useModalLinks
				/>
			);
		},
	}),
];
