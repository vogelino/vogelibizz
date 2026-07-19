import { ChevronDownIcon } from "lucide-react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/utility/classNames";

type NavigationMenuProps = ComponentProps<
	typeof NavigationMenuPrimitive.Root
> & {
	viewport?: boolean;
};

function NavigationMenu({
	className,
	children,
	viewport = true,
	...props
}: NavigationMenuProps) {
	return (
		<NavigationMenuPrimitive.Root
			data-slot="navigation-menu"
			data-viewport={viewport}
			className={cn(
				"group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
				className,
			)}
			{...props}
		>
			{children}
			{viewport && <NavigationMenuViewport />}
		</NavigationMenuPrimitive.Root>
	);
}

type NavigationMenuListProps = ComponentProps<
	typeof NavigationMenuPrimitive.List
>;

function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
	return (
		<NavigationMenuPrimitive.List
			data-slot="navigation-menu-list"
			className={cn(
				"group flex flex-1 list-none items-center justify-center gap-1",
				className,
			)}
			{...props}
		/>
	);
}

type NavigationMenuItemProps = ComponentProps<
	typeof NavigationMenuPrimitive.Item
>;

function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
	return (
		<NavigationMenuPrimitive.Item
			data-slot="navigation-menu-item"
			className={cn("relative", className)}
			{...props}
		/>
	);
}

const navigationMenuTriggerStyle = cn(
	"group inline-flex w-max items-center justify-center",
	"px-4 py-2 font-medium transition-colors",
	"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
	"focusable disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50",
	"data-[state=open]:text-accent-foreground data-[state=open]:hover:bg-accent",
	"data-[state=open]:focus:bg-accent",
);

type NavigationMenuTriggerProps = ComponentProps<
	typeof NavigationMenuPrimitive.Trigger
>;

function NavigationMenuTrigger({
	className,
	children,
	...props
}: NavigationMenuTriggerProps) {
	return (
		<NavigationMenuPrimitive.Trigger
			data-slot="navigation-menu-trigger"
			className={cn(navigationMenuTriggerStyle, "group", className)}
			{...props}
		>
			{children}{" "}
			<ChevronDownIcon
				className="relative ml-2 size-4 transition duration-300 group-data-[state=open]:rotate-180 text-muted-foreground"
				aria-hidden="true"
			/>
		</NavigationMenuPrimitive.Trigger>
	);
}

type NavigationMenuContentProps = ComponentProps<
	typeof NavigationMenuPrimitive.Content
>;

function NavigationMenuContent({
	className,
	...props
}: NavigationMenuContentProps) {
	return (
		<NavigationMenuPrimitive.Content
			data-slot="navigation-menu-content"
			className={cn(
				"p-1 pr-1.5 pb-1.5 top-0 left-0 w-full data-[motion=from-end]:slide-in-from-right-24",
				"data-[motion=from-start]:slide-in-from-left-24 data-[motion=to-end]:slide-out-to-right-24",
				"data-[motion=to-start]:slide-out-to-left-24 data-[motion^=from-]:animate-in",
				"data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
				"md:absolute md:w-auto",
				"group-data-[viewport=false]/navigation-menu:top-full",
				"group-data-[viewport=false]/navigation-menu:mt-1.5",
				"group-data-[viewport=false]/navigation-menu:overflow-hidden",
				"group-data-[viewport=false]/navigation-menu:border",
				"group-data-[viewport=false]/navigation-menu:border-border",
				"group-data-[viewport=false]/navigation-menu:bg-popover",
				"group-data-[viewport=false]/navigation-menu:text-popover-foreground",
				"group-data-[viewport=false]/navigation-menu:shadow",
				"group-data-[viewport=false]/navigation-menu:duration-200",
				"**:data-[slot=navigation-menu-link]:focus:ring-0",
				"**:data-[slot=navigation-menu-link]:focus:outline-none",
				"group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out",
				"group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0",
				"group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95",
				"group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in",
				"group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0",
				"group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
				className,
			)}
			{...props}
		/>
	);
}

type NavigationMenuViewportProps = ComponentProps<
	typeof NavigationMenuPrimitive.Viewport
>;

function NavigationMenuViewport({
	className,
	...props
}: NavigationMenuViewportProps) {
	return (
		<div
			className={cn(
				"absolute top-full left-0 isolate z-50 flex justify-center",
			)}
		>
			<NavigationMenuPrimitive.Viewport
				data-slot="navigation-menu-viewport"
				className={cn(
					"origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height)",
					"w-full overflow-hidden border border-border bg-popover text-popover-foreground shadow",
					"data-[state=closed]:animate-out data-[state=closed]:zoom-out-95",
					"data-[state=open]:animate-in data-[state=open]:zoom-in-90",
					"md:w-(--radix-navigation-menu-viewport-width)",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function NavigationMenuLink({
	className,
	...props
}: ComponentProps<typeof NavigationMenuPrimitive.Link>) {
	return (
		<NavigationMenuPrimitive.Link
			data-slot="navigation-menu-link"
			className={cn(
				"flex flex-col gap-1 p-2 transition-all outline-none hover:bg-accent",
				"hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
				"focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
				"data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground",
				"data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent",
				"[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

type NavigationMenuIndicatorProps = ComponentProps<
	typeof NavigationMenuPrimitive.Indicator
>;

function NavigationMenuIndicator({
	className,
	...props
}: NavigationMenuIndicatorProps) {
	return (
		<NavigationMenuPrimitive.Indicator
			data-slot="navigation-menu-indicator"
			className={cn(
				"top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
				"data-[state=hidden]:animate-out data-[state=hidden]:fade-out",
				"data-[state=visible]:animate-in data-[state=visible]:fade-in",
				className,
			)}
			{...props}
		>
			<div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
		</NavigationMenuPrimitive.Indicator>
	);
}

export {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
	navigationMenuTriggerStyle,
};
