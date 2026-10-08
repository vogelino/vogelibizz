"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarPlusIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utility/classNames";

export type RowActionOptions<RowType> = {
  onEdit: (row: RowType) => void;
  onDuplicate?: (row: RowType) => void;
  canDuplicate?: (row: RowType) => boolean;
  onCreateRecurringExpense?: (row: RowType) => void;
  canCreateRecurringExpense?: (row: RowType) => boolean;
  onDelete: (row: RowType) => void;
  canShowActions?: (row: RowType) => boolean;
};

export function getRowActionsColumn<RowType extends { id: string | number }>({
  onEdit,
  onDuplicate,
  canDuplicate,
  onCreateRecurringExpense,
  canCreateRecurringExpense,
  onDelete,
  canShowActions = () => true,
  // TanStack column typing requires an unconstrained row value here.
}: RowActionOptions<RowType>): ColumnDef<RowType, any> {
  return {
    id: "actions",
    header: " ",
    size: 50,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) =>
      canShowActions(row.original) ? (
        <RowActions
          row={row.original}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          canDuplicate={canDuplicate}
          onCreateRecurringExpense={onCreateRecurringExpense}
          canCreateRecurringExpense={canCreateRecurringExpense}
          onDelete={onDelete}
        />
      ) : null,
  };
}

export function RowActionsContextMenu<RowType>({
  row,
  onEdit,
  onDuplicate,
  canDuplicate,
  onCreateRecurringExpense,
  canCreateRecurringExpense,
  onDelete,
  children,
}: RowActionOptions<RowType> & { row: RowType; children: ReactNode }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  return (
    <>
      <ContextMenu modal={false} open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <ContextMenuTrigger asChild data-context-menu-open={contextMenuOpen ? "" : undefined}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => onEdit(row)}>
            <PencilIcon className="size-4" />
            Edit
          </ContextMenuItem>
          {onDuplicate && (canDuplicate?.(row) ?? true) ? (
            <ContextMenuItem onSelect={() => onDuplicate(row)}>
              <CopyIcon className="size-4" />
              Duplicate
            </ContextMenuItem>
          ) : null}
          {onCreateRecurringExpense && (canCreateRecurringExpense?.(row) ?? true) ? (
            <ContextMenuItem onSelect={() => onCreateRecurringExpense(row)}>
              <CalendarPlusIcon className="size-4" />
              Create recurring expense
            </ContextMenuItem>
          ) : null}
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2Icon className="size-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <DeleteConfirmation
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onDelete={() => onDelete(row)}
      />
    </>
  );
}

function RowActions<RowType extends { id: string | number }>({
  row,
  onEdit,
  onDuplicate,
  canDuplicate,
  onCreateRecurringExpense,
  canCreateRecurringExpense,
  onDelete,
}: RowActionOptions<RowType> & { row: RowType }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open row actions">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(row)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          {onDuplicate && (canDuplicate?.(row) ?? true) ? (
            <DropdownMenuItem onSelect={() => onDuplicate(row)}>
              <CopyIcon className="size-4" />
              Duplicate
            </DropdownMenuItem>
          ) : null}
          {onCreateRecurringExpense && (canCreateRecurringExpense?.(row) ?? true) ? (
            <DropdownMenuItem onSelect={() => onCreateRecurringExpense(row)}>
              <CalendarPlusIcon className="size-4" />
              Create recurring expense
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmation
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onDelete={() => onDelete(row)}
      />
    </>
  );
}

function DeleteConfirmation({
  open,
  onOpenChange,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => {
              // Let Radix release the dialog's focus and scroll locks before the
              // mutation can remove the row that owns this dialog.
              requestAnimationFrame(onDelete);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
