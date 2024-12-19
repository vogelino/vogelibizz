import type { ColumnDef } from "@tanstack/react-table";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  timeZone: "UTC",
  timeZoneName: "short",
});

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
      const formattedDateWithTime = dateFormatter.format(
        new Date(getValue<string>()),
      );
      return (
        <span className="text-xs font-mono text-grayDark">
          {formattedDateWithTime}
        </span>
      );
    },
  };
}
