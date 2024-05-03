import type { useTable } from "@refinedev/react-table";
import { useEffect } from "react";

export function useDefaultSort({
  setSorting,
  defaultColumnId,
  desc = true,
}: {
  setSorting: ReturnType<typeof useTable>["setSorting"];
  defaultColumnId: string;
  desc?: boolean;
}): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const allParameterKeys = [...urlParams.keys()];
    const hasKeyStartingWithSorters = allParameterKeys.some((key) =>
      key.startsWith("sorters")
    );

    if (!hasKeyStartingWithSorters) {
      setSorting([{ id: defaultColumnId, desc }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
