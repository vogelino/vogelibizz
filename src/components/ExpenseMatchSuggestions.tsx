"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { type Dispatch, type SetStateAction, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExpenseMatchSuggestion } from "@/utility/expenseMatchSuggestions";

export function updateExpenseMatchSelection(
	selected: ReadonlySet<number>,
	orderedIds: readonly number[],
	anchorId: number | null,
	targetId: number,
	checked: boolean,
	shiftKey: boolean,
) {
	const next = new Set(selected);
	const targetIndex = orderedIds.indexOf(targetId);
	if (targetIndex === -1) return next;
	const anchorIndex =
		shiftKey && anchorId !== null ? orderedIds.indexOf(anchorId) : -1;
	const start =
		anchorIndex === -1 ? targetIndex : Math.min(anchorIndex, targetIndex);
	const end =
		anchorIndex === -1 ? targetIndex : Math.max(anchorIndex, targetIndex);
	for (const id of orderedIds.slice(start, end + 1)) {
		if (checked) next.add(id);
		else next.delete(id);
	}
	return next;
}

export default function ExpenseMatchSuggestions({
	matches,
	selectedIds,
	setSelectedIds,
	isFetching,
	hasError,
	disabled = false,
	description,
	emptyMessage = "No clear matches found.",
	idPrefix,
}: {
	matches: ExpenseMatchSuggestion[];
	selectedIds: Set<number>;
	setSelectedIds: Dispatch<SetStateAction<Set<number>>>;
	isFetching: boolean;
	hasError: boolean;
	disabled?: boolean;
	description: string;
	emptyMessage?: string;
	idPrefix: string;
}) {
	const anchorId = useRef<number | null>(null);
	const shiftKey = useRef(false);
	const ids = matches.map(({ id }) => id);
	const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
	const allSelected = ids.length > 0 && selectedCount === ids.length;
	const toggleMatch = (id: number, checked: boolean, shift: boolean) => {
		setSelectedIds((previous) =>
			updateExpenseMatchSelection(
				previous,
				ids,
				anchorId.current,
				id,
				checked,
				shift,
			),
		);
		anchorId.current = id;
		shiftKey.current = false;
	};
	const columns: ColumnDef<ExpenseMatchSuggestion>[] = [
		{
			id: "select",
			header: () => (
				<Checkbox
					aria-label="Select all matching transactions"
					checked={
						allSelected ? true : selectedCount > 0 ? "indeterminate" : false
					}
					onCheckedChange={(checked) => {
						setSelectedIds((previous) => {
							const next = new Set(previous);
							for (const id of ids) {
								if (checked === true) next.add(id);
								else next.delete(id);
							}
							return next;
						});
						anchorId.current = null;
					}}
					disabled={disabled || ids.length === 0}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					id={`${idPrefix}-${row.original.id}`}
					checked={selectedIds.has(row.original.id)}
					onCheckedChange={(checked) => {
						toggleMatch(row.original.id, checked === true, shiftKey.current);
					}}
					disabled={disabled}
				/>
			),
		},
		{
			accessorKey: "description",
			header: "Name",
			cell: ({ row }) => (
				<>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: The adjacent checkbox handles keyboard selection; this intercepts Shift-click on its label. */}
					<label
						htmlFor={`${idPrefix}-${row.original.id}`}
						className="block cursor-pointer truncate"
						title={row.original.description}
						onClick={(event) => {
							if (!event.shiftKey || disabled) return;
							event.preventDefault();
							toggleMatch(
								row.original.id,
								!selectedIds.has(row.original.id),
								true,
							);
						}}
					>
						{row.original.description}
					</label>
				</>
			),
		},
		{
			accessorKey: "bookedAt",
			header: "Date",
			cell: ({ row }) => (
				<time dateTime={row.original.bookedAt}>{row.original.bookedAt}</time>
			),
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => `CHF ${row.original.amount.toFixed(2)}`,
		},
	];
	const table = useReactTable({
		data: matches,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => String(row.id),
	});

	return (
		<section aria-label="Matching transactions">
			<h3 className="font-medium">Matching transactions</h3>
			<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			<table className="mt-3 w-full table-fixed text-sm">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									scope="col"
									className={
										header.column.id === "select"
											? "w-7 border-b border-border py-2 text-left"
											: header.column.id === "bookedAt"
												? "w-24 border-b border-border py-2 pl-2 text-left font-medium"
												: header.column.id === "amount"
													? "w-20 border-b border-border py-2 text-right font-medium"
													: "border-b border-border py-2 text-left font-medium"
									}
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{isFetching || hasError || matches.length === 0 ? (
						<tr>
							<td
								colSpan={4}
								role={hasError ? "alert" : undefined}
								className="py-3 text-sm text-muted-foreground"
							>
								{isFetching
									? "Checking expense history…"
									: hasError
										? "Matches could not be loaded. You can still create the expense."
										: emptyMessage}
							</td>
						</tr>
					) : (
						table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="select-none"
								onClickCapture={(event) => {
									shiftKey.current = event.shiftKey;
								}}
								onKeyDownCapture={(event) => {
									shiftKey.current = event.shiftKey;
								}}
							>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className={
											cell.column.id === "select"
												? "py-2"
												: cell.column.id === "amount"
													? "py-2 text-right whitespace-nowrap"
													: cell.column.id === "bookedAt"
														? "py-2 pl-2 text-left whitespace-nowrap"
														: "py-2 text-left whitespace-nowrap overflow-hidden"
										}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))
					)}
				</tbody>
			</table>
		</section>
	);
}
