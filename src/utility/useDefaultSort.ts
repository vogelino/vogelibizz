import type { useReactTable } from "@tanstack/react-table";
import { useEffect } from "react";

export function useDefaultSort({
  setSorting,
  defaultColumnId,
  desc = true,
}: {
  setSorting: ReturnType<typeof useReactTable>["setSorting"];
  defaultColumnId: string;
  desc?: boolean;
}): void {
  // Runs once intentionally.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const allParameterKeys = [...urlParams.keys()];
    const hasKeyStartingWithSorters = allParameterKeys.some((key) => key.startsWith("sorters"));

    if (!hasKeyStartingWithSorters) {
      setSorting([{ id: defaultColumnId, desc }]);
    }
  }, []);
}
