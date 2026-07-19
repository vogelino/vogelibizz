"use client";

import {
	type ComponentProps,
	type ComponentPropsWithoutRef,
	forwardRef,
	type HTMLAttributes,
} from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/utility/classNames";

const Drawer = ({
	shouldScaleBackground = true,
	...props
}: ComponentProps<typeof DrawerPrimitive.Root>) => (
	<DrawerPrimitive.Root
		shouldScaleBackground={shouldScaleBackground}
		{...props}
	/>
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

type DrawerOverlayProps = ComponentPropsWithoutRef<
	typeof DrawerPrimitive.Overlay
>;
const DrawerOverlay = forwardRef<HTMLDivElement, DrawerOverlayProps>(
	({ className, ...props }, ref) => (
		<DrawerPrimitive.Overlay
			ref={ref}
			className={cn("fixed inset-0 z-50 bg-overlay", className)}
			{...props}
		/>
	),
);
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

type DrawerContentProps = ComponentPropsWithoutRef<
	typeof DrawerPrimitive.Content
>;
const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
	({ className, children, ...props }, ref) => (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				ref={ref}
				className={cn(
					`max-h-screen max-w-[100vw] fixed z-50 bottom-0`,
					`flex-col bg-background`,
					className,
				)}
				{...props}
			>
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	),
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"grid gap-1.5 p-6 text-center sm:text-left",
			"border-b border-border",
			className,
		)}
		{...props}
	/>
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"mt-auto flex gap-4 justify-end p-6",
			"border-t border-border",
			className,
		)}
		{...props}
	/>
);
DrawerFooter.displayName = "DrawerFooter";

type DrawerTitleProps = ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>;
const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
	({ className, ...props }, ref) => (
		<DrawerPrimitive.Title
			ref={ref}
			className={cn(
				"text-lg font-semibold leading-none tracking-tight",
				className,
			)}
			{...props}
		/>
	),
);
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

type DrawerDescriptionProps = ComponentPropsWithoutRef<
	typeof DrawerPrimitive.Description
>;
const DrawerDescription = forwardRef<
	HTMLParagraphElement,
	DrawerDescriptionProps
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerPortal,
	DrawerTitle,
	DrawerTrigger,
};
