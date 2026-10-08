"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utility/classNames";

import { updateRangeSelection } from "./rangeSelection";

type ClassNames = {
  table?: string;
  container?: string;
  toolbarContainer?: string;
  toolbar?: string;
  caption?: string;
  header?: string;
  head?: string;
  body?: string;
  row?: string;
  cell?: string;
  skeleton?: string;
  pagination?: string;
  paginationInfo?: string;
  paginationButton?: string;
  previousButton?: string;
  nextButton?: string;
};

type DataTableProps<TData> = {
  // TanStack column typing requires an unconstrained row value here.
  columns: ColumnDef<TData, any>[];
  data: TData[];
  initialState?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    pagination?: PaginationState;
  };
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  enableMultiSort?: boolean;
  toolbar?: (table: TanstackTable<TData>) => ReactNode;
  toolbarVisible?: boolean;
  loading?: boolean;
  skeletonRows?: number;
  toolbarSkeleton?: ReactNode;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  onSelectionChange?: (rows: TData[]) => void;
  getRowId?: TableOptions<TData>["getRowId"];
  caption?: ReactNode;
  emptyMessage?: ReactNode;
  classNames?: ClassNames;
  containerAriaLabel?: string;
  virtualized?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onEndReached?: () => void;
  rowContextMenu?: (row: TData, trigger: ReactNode) => ReactNode;
  onOpenRow?: (row: TData) => void;
  canOpenRow?: (row: TData) => boolean;
  openRowColumnId?: string;
};

export function DataTable<TData>({
  columns,
  data,
  initialState,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  enableMultiSort,
  toolbar,
  toolbarVisible = true,
  loading = false,
  skeletonRows = 6,
  toolbarSkeleton,
  enableRowSelection = false,
  onSelectionChange,
  getRowId,
  caption,
  emptyMessage = "No results.",
  classNames = {},
  containerAriaLabel,
  virtualized = false,
  hasMore = false,
  loadingMore = false,
  onEndReached,
  rowContextMenu,
  onOpenRow,
  canOpenRow,
  openRowColumnId = "name",
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(initialState?.sorting ?? []);
  const sorting = controlledSorting ?? internalSorting;
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setInternalSorting(updater);
    onSortingChange?.(updater);
  };
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState?.columnFilters ?? [],
  );
  const [pagination, setPagination] = useState<PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(virtualized ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    onSortingChange: handleSortingChange,
    manualSorting,
    enableMultiSort,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    getRowId,
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
    },
  });

  const selectedRows = useMemo(
    () =>
      Object.values(rowSelection).some(Boolean)
        ? table.getSelectedRowModel().rows.map((row) => row.original)
        : [],
    [table, rowSelection],
  );

  useEffect(() => {
    if (!enableRowSelection || !onSelectionChange) return;
    onSelectionChange(selectedRows);
  }, [enableRowSelection, onSelectionChange, selectedRows]);

  const skeletonRowKeys = useMemo(
    () =>
      Array.from(
        { length: Math.max(1, skeletonRows) },
        (_, index) => `sr-${index}-${skeletonRows}`,
      ),
    [skeletonRows],
  );

  const rows = table.getRowModel().rows;
  const lastSelectedRowId = useRef<string | null>(null);
  const handleRowSelectionClickCapture = (event: ReactMouseEvent<HTMLTableSectionElement>) => {
    if (!enableRowSelection || !(event.target instanceof Element)) return;
    const checkbox = event.target.closest('[role="checkbox"]');
    if (!checkbox) return;

    const rowId = checkbox.closest("tr")?.dataset.rowId;
    if (!rowId) {
      lastSelectedRowId.current = null;
      return;
    }
    if (!event.shiftKey) {
      lastSelectedRowId.current = rowId;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const targetRow = rows.find((row) => row.id === rowId);
    if (!targetRow) return;
    const rowsById = new Map(rows.map((row) => [row.id, row]));
    setRowSelection((selection) =>
      updateRangeSelection(
        selection,
        rows.map((row) => row.id),
        lastSelectedRowId.current,
        rowId,
        !targetRow.getIsSelected(),
        (candidateRowId) => rowsById.get(candidateRowId)?.getCanSelect() ?? false,
      ),
    );
    lastSelectedRowId.current = rowId;
  };
  const loadingMoreSkeletonRows = 3;
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const rowVirtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>({
    count: virtualized ? rows.length + (hasMore ? loadingMoreSkeletonRows : 0) : 0,
    // reset.css makes body the fixed-height overflow element, so window does
    // not receive the scroll events that advance this virtual range.
    getScrollElement: () => (typeof document === "undefined" ? null : document.body),
    estimateSize: () => 52,
    overscan: 8,
    scrollMargin,
    enabled: virtualized,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const firstVirtualRow = virtualRows[0];
  const lastVirtualRow = virtualRows.at(-1);
  const paddingTop = firstVirtualRow ? Math.max(0, firstVirtualRow.start - scrollMargin) : 0;
  const paddingBottom = lastVirtualRow
    ? Math.max(0, rowVirtualizer.getTotalSize() - (lastVirtualRow.end - scrollMargin))
    : 0;

  useEffect(() => {
    if (!virtualized) return;
    const measureScrollMargin = () => {
      const body = tableBodyRef.current;
      if (!body) return;
      setScrollMargin(body.getBoundingClientRect().top + document.body.scrollTop);
    };
    measureScrollMargin();
    const resizeObserver = new ResizeObserver(measureScrollMargin);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", measureScrollMargin);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureScrollMargin);
    };
  }, [virtualized]);

  useEffect(() => {
    if (
      virtualized &&
      hasMore &&
      !loadingMore &&
      lastVirtualRow &&
      lastVirtualRow.index >= rows.length
    ) {
      onEndReached?.();
    }
  }, [hasMore, lastVirtualRow, loadingMore, onEndReached, rows.length, virtualized]);

  const showPagination = !virtualized && table.getPageCount() > 1;

  return (
    <>
      {toolbar ? (
        <div
          className={cn(
            "sticky left-0 top-16 z-20 grid overflow-clip bg-background",
            "transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
            toolbarVisible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            classNames.toolbarContainer,
          )}
          aria-hidden={!toolbarVisible}
          inert={!toolbarVisible}
        >
          <div className={cn("min-h-0 overflow-clip pb-3", classNames.toolbar)}>
            {loading ? (toolbarSkeleton ?? null) : toolbar(table)}
          </div>
        </div>
      ) : null}
      <section
        className={cn("grow", classNames.container)}
        aria-label={containerAriaLabel}
        tabIndex={containerAriaLabel ? 0 : undefined}
      >
        <Table className={classNames.table}>
          {caption ? (
            <TableCaption className={cn("sr-only", classNames.caption)}>{caption}</TableCaption>
          ) : null}
          <TableHeader
            className={cn(
              "sticky top-16 bg-background z-10 transition-[top] duration-300 ease-out motion-reduce:transition-none",
              "[&_th:first-child]:pl-6 md:[&_th:first-child]:pl-10 [&_th:last-child]:pr-6 md:[&_th:last-child]:pr-10",
              "shadow shadow-black/5",
              classNames.header,
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={classNames.row}>
                {headerGroup.headers.map((header) => {
                  const { column } = header;
                  const sort = column.getIsSorted();
                  const iconClass = cn("ml-2 h-4 w-4", sort && "text-foreground");
                  const label = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: `${header.getSize()}px` }}
                      className={classNames.head}
                    >
                      {column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          onClick={column.getToggleSortingHandler()}
                          className={cn("group pl-0 pr-6 hover:bg-transparent hover:text-primary")}
                        >
                          {label}
                          {!sort && <ArrowUpDown className={iconClass} />}
                          {sort === "asc" && <ArrowDown className={iconClass} />}
                          {sort === "desc" && <ArrowUp className={iconClass} />}
                        </Button>
                      ) : (
                        label
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            ref={tableBodyRef}
            onClickCapture={handleRowSelectionClickCapture}
            className={cn(
              "[&_td:first-child]:pl-6 md:[&_td:first-child]:pl-10 [&_td:last-child]:pr-6 md:[&_td:last-child]:pr-10",
              classNames.body,
            )}
          >
            {loading ? (
              skeletonRowKeys.map((rowKey) => (
                <TableRow key={rowKey} className={cn("relative", classNames.row)}>
                  {table.getAllColumns().map((column) => (
                    <TableCell
                      key={`${rowKey}-${column.id}`}
                      style={{ width: `${column.getSize()}px` }}
                      className={classNames.cell}
                    >
                      <Skeleton className={cn("h-5 w-full", classNames.skeleton)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length || (virtualized && hasMore) ? (
              <>
                {virtualized && paddingTop > 0 ? (
                  <tr className="border-0 pointer-events-none">
                    <td
                      colSpan={table.getAllColumns().length}
                      style={{ height: paddingTop, padding: 0 }}
                    />
                  </tr>
                ) : null}
                {(virtualized ? virtualRows : rows).map((item) => {
                  const virtualItem = virtualized ? (item as VirtualItem) : null;
                  const row: Row<TData> | undefined = virtualized
                    ? rows[item.index]
                    : (item as Row<TData>);
                  if (!row) {
                    return (
                      <TableRow
                        key={`load-more-${virtualItem?.index}`}
                        aria-label={
                          virtualItem?.index === rows.length
                            ? "Loading more transactions"
                            : undefined
                        }
                        data-index={virtualItem?.index}
                        ref={virtualized ? rowVirtualizer.measureElement : undefined}
                      >
                        {table.getAllColumns().map((column) => (
                          <TableCell
                            key={`load-more-${virtualItem?.index}-${column.id}`}
                            style={{ width: `${column.getSize()}px` }}
                            className={classNames.cell}
                          >
                            <Skeleton className={cn("h-5 w-full", classNames.skeleton)} />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  }
                  const rowElement = (
                    <TableRow
                      key={row.id}
                      data-row-id={row.id}
                      data-index={virtualItem?.index}
                      ref={virtualized ? rowVirtualizer.measureElement : undefined}
                      className={cn("group/row relative", classNames.row)}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: `${cell.column.getSize()}px` }}
                          className={classNames.cell}
                        >
                          {onOpenRow &&
                          cell.column.id === openRowColumnId &&
                          (canOpenRow?.(row.original) ?? true) ? (
                            <div className="flex min-w-0 items-center gap-1">
                              <div className="min-w-0 flex-1">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Open ${String(cell.getValue() ?? "item")}`}
                                onClick={() => onOpenRow(row.original)}
                                className="size-9 shrink-0 opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
                              >
                                <ChevronRight className="size-4" />
                              </Button>
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                  return rowContextMenu ? rowContextMenu(row.original, rowElement) : rowElement;
                })}
                {virtualized && paddingBottom > 0 ? (
                  <tr className="border-0 pointer-events-none">
                    <td
                      colSpan={table.getAllColumns().length}
                      style={{ height: paddingBottom, padding: 0 }}
                    />
                  </tr>
                ) : null}
              </>
            ) : (
              <TableRow className={classNames.row}>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className={cn("h-24 text-center", classNames.cell)}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
      {showPagination ? (
        <div
          className={cn(
            "flex items-center justify-end space-x-2 py-4 px-6 md:px-10 sticky left-0",
            classNames.pagination,
          )}
        >
          <div className={cn("flex-1 text-sm text-muted-foreground", classNames.paginationInfo)}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn(classNames.paginationButton, classNames.previousButton)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn(classNames.paginationButton, classNames.nextButton)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </>
  );
}
