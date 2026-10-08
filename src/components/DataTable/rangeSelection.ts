import type { RowSelectionState } from "@tanstack/react-table";

export function updateRangeSelection(
  selection: RowSelectionState,
  orderedRowIds: readonly string[],
  anchorRowId: string | null,
  targetRowId: string,
  selected: boolean,
  canSelect: (rowId: string) => boolean = () => true,
): RowSelectionState {
  const targetIndex = orderedRowIds.indexOf(targetRowId);
  if (targetIndex === -1) return selection;

  const anchorIndex = anchorRowId ? orderedRowIds.indexOf(anchorRowId) : targetIndex;
  const rangeStart = Math.min(anchorIndex === -1 ? targetIndex : anchorIndex, targetIndex);
  const rangeEnd = Math.max(anchorIndex === -1 ? targetIndex : anchorIndex, targetIndex);
  const nextSelection = { ...selection };

  for (const rowId of orderedRowIds.slice(rangeStart, rangeEnd + 1)) {
    if (!canSelect(rowId)) continue;
    if (selected) nextSelection[rowId] = true;
    else delete nextSelection[rowId];
  }

  return nextSelection;
}
