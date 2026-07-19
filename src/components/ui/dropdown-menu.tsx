"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
	CheckIcon,
	ChevronRightIcon,
	DotFilledIcon,
} from "@radix-ui/react-icons";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type HTMLAttributes,
} from "react";
import { cn } from "@/utility/classNames";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

type DropdownMenuSubTriggerProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.SubTrigger
> & {
	inset?: boolean;
};
const DropdownMenuSubTrigger = forwardRef<
	HTMLDivElement,
	DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			"flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
			inset && "pl-8",
			className,
		)}
		{...props}
	>
		{children}
		<ChevronRightIcon className="ml-auto h-4 w-4" />
	</DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
	DropdownMenuPrimitive.SubTrigger.displayName;

type DropdownMenuSubContentProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.SubContent
>;
const DropdownMenuSubContent = forwardRef<
	HTMLDivElement,
	DropdownMenuSubContentProps
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			"z-50 min-w-32 overflow-hidden border",
			"bg-background p-1 text-foreground border-border",
			"data-[state=open]:animate-in",
			"data-[state=closed]:animate-out",
			"data-[state=closed]:fade-out-0",
			"data-[state=open]:fade-in-0",
			"data-[state=closed]:zoom-out-95",
			"data-[state=open]:zoom-in-95",
			"data-[side=bottom]:slide-in-from-top-2",
			"data-[side=left]:slide-in-from-right-2",
			"data-[side=right]:slide-in-from-left-2",
			"data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...props}
	/>
));
DropdownMenuSubContent.displayName =
	DropdownMenuPrimitive.SubContent.displayName;

type DropdownMenuContentProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Content
>;
const DropdownMenuContent = forwardRef<
	HTMLDivElement,
	DropdownMenuContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				"z-50 min-w-32 overflow-hidden border bg-background",
				"text-foreground border-border",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
				"data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

type DropdownMenuItemProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Item
> & {
	inset?: boolean;
};
const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
	({ className, inset, ...props }, ref) => (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={cn(
				"items-center gap-2 focus:cursor-pointer",
				"relative flex cursor-default select-none items-center px-4 py-2 text-sm",
				"outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
				"data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	),
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

type DropdownMenuCheckboxItemProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.CheckboxItem
>;
const DropdownMenuCheckboxItem = forwardRef<
	HTMLDivElement,
	DropdownMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
	<DropdownMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<CheckIcon className="size-5" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
	DropdownMenuPrimitive.CheckboxItem.displayName;

type DropdownMenuRadioItemProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.RadioItem
>;
const DropdownMenuRadioItem = forwardRef<
	HTMLDivElement,
	DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<DotFilledIcon className="h-4 w-4 fill-current" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

type DropdownMenuLabelProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Label
> & {
	inset?: boolean;
};
const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
	({ className, inset, ...props }, ref) => (
		<DropdownMenuPrimitive.Label
			ref={ref}
			className={cn(
				"px-4 py-3 text-sm font-semibold",
				"text-muted-foreground border-b border-border",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	),
);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Separator
>;
const DropdownMenuSeparator = forwardRef<
	HTMLHRElement,
	DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-border", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
	className,
	...props
}: HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn("ml-auto tracking-widest opacity-60", className)}
			{...props}
		/>
	);
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
