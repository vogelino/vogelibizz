import type { ColumnDef } from "@tanstack/react-table";
import { format, formatRelative, parseISO } from "date-fns";
import { getNowInUTC } from "./timeUtil";

export function useLastModifiedColumn<
  ColumnType,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
>(): ColumnDef<ColumnType, any> {
  return {
    id: "last_modified",
    accessorKey: "last_modified",
    size: 100,
    header: "Last modified",
    sortingFn: "datetime",
    cell: function render({ getValue }) {
      const value = getValue<string>();
      const formattedDateWithTime = formatRelative(
        parseISO(value),
        getNowInUTC(),
      );
      return (
        <span className="text-xs font-mono text-grayDark">
          {ucFirst(formattedDateWithTime)}
        </span>
      );
    },
  };
}

function ucFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
