"use client";

import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type HTMLAttributes,
} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/utility/classNames";

type CommandProps = ComponentPropsWithoutRef<typeof CommandPrimitive>;
const Command = forwardRef<HTMLDivElement, CommandProps>(
	({ className, ...props }, ref) => (
		<CommandPrimitive
			ref={ref}
			className={cn(
				"flex h-full w-full flex-col overflow-hidden bg-background text-foreground",
				className,
			)}
			{...props}
		/>
	),
);
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
	return (
		<Dialog {...props}>
			<DialogContent className="overflow-hidden p-0">
				<Command
					className={cn(
						"**:[[cmdk-group-heading]]:px-2",
						"**:[[cmdk-group-heading]]:font-medium",
						"**:[[cmdk-group-heading]]:text-muted-foreground",
						"[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
						"**:[[cmdk-group]]:px-2",
						"[&_[cmdk-input-wrapper]_svg]:h-5",
						"[&_[cmdk-input-wrapper]_svg]:w-5",
						"**:[[cmdk-input]]:h-12",
						"**:[[cmdk-item]]:px-2",
						"**:[[cmdk-item]]:py-3",
						"[&_[cmdk-item]_svg]:h-5",
						"[&_[cmdk-item]_svg]:w-5",
					)}
				>
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
};

type CommandInputProps = ComponentPropsWithoutRef<
	typeof CommandPrimitive.Input
>;
const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
	({ className, ...props }, ref) => (
		<div
			className="flex items-center border-b border-border pl-3"
			cmdk-input-wrapper=""
		>
			<SearchIcon className="mr-2 shrink-0 opacity-50 text-muted-foreground" />
			<CommandPrimitive.Input
				ref={ref}
				className={cn(
					"flex h-10 w-full bg-transparent py-2 outline-none border-none",
					"placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
					"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
					className,
				)}
				{...props}
			/>
		</div>
	),
);
CommandInput.displayName = CommandPrimitive.Input.displayName;

type CommandListProps = ComponentPropsWithoutRef<typeof CommandPrimitive.List>;
const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.List
			ref={ref}
			className={cn("max-h-75 overflow-y-auto overflow-x-hidden", className)}
			{...props}
		/>
	),
);
CommandList.displayName = CommandPrimitive.List.displayName;

type CommandEmptyProps = ComponentPropsWithoutRef<
	typeof CommandPrimitive.Empty
>;
const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
	(props, ref) => (
		<CommandPrimitive.Empty
			ref={ref}
			className="py-6 text-center text-sm"
			{...props}
		/>
	),
);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

type CommandGroupProps = ComponentPropsWithoutRef<
	typeof CommandPrimitive.Group
>;
const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Group
			ref={ref}
			className={cn(
				"overflow-hidden text-foreground",
				"**:[[cmdk-group-heading]]:px-4",
				"**:[[cmdk-group-heading]]:py-1.5",
				"**:[[cmdk-group-heading]]:text-sm",
				"**:[[cmdk-group-heading]]:font-medium",
				"**:[[cmdk-group-heading]]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	),
);
CommandGroup.displayName = CommandPrimitive.Group.displayName;

type CommandSeparatorProps = ComponentPropsWithoutRef<
	typeof CommandPrimitive.Separator
>;
const CommandSeparator = forwardRef<HTMLHRElement, CommandSeparatorProps>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Separator
			ref={ref}
			className={cn("-mx-1 h-px bg-border", className)}
			{...props}
		/>
	),
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

type CommandItemProps = ComponentPropsWithoutRef<typeof CommandPrimitive.Item>;
const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Item
			ref={ref}
			className={cn(
				"relative flex cursor-default select-none",
				"items-center px-4 py-2 gap-2",
				"outline-none aria-selected:bg-accent",
				"aria-selected:text-accent-foreground aria-selected:cursor-pointer",
				"data-[disabled=true]:pointer-events-none",
				"data-[disabled=true]:opacity-50",
				"transition-colors border-b border-border",
				"last-of-type:border-b-0",
				className,
			)}
			{...props}
		/>
	),
);
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
	className,
	...props
}: HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn("ml-auto tracking-widest text-muted-foreground", className)}
			{...props}
		/>
	);
};
CommandShortcut.displayName = "CommandShortcut";

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
