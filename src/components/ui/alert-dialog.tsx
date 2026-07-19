"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type HTMLAttributes,
} from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utility/classNames";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

type AlertDialogOverlayProps = ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Overlay
>;
const AlertDialogOverlay = forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
	({ className, ...props }, ref) => (
		<AlertDialogPrimitive.Overlay
			className={cn(
				"fixed inset-0 z-50 bg-overlay",
				"data-[state=open]:animate-in",
				"data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0",
				"data-[state=open]:fade-in-0",
				className,
			)}
			{...props}
			ref={ref}
		/>
	),
);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

type AlertDialogContentProps = ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Content
>;
const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
	({ className, ...props }, ref) => (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				ref={ref}
				className={cn(
					"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg",
					"translate-x-[-50%] translate-y-[-50%] gap-4 border border-border",
					"bg-background p-6 duration-200",
					"data-[state=open]:animate-in data-[state=closed]:animate-out",
					"data-[state=closed]:fade-out-0",
					"data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95",
					"data-[state=open]:zoom-in-95",
					"data-[state=closed]:slide-out-to-bottom-5",
					"data-[state=open]:slide-in-from-bottom-5",
					className,
				)}
				{...props}
			/>
		</AlertDialogPortal>
	),
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-4",
			className,
		)}
		{...props}
	/>
);
AlertDialogFooter.displayName = "AlertDialogFooter";

type AlertDialogTitleProps = ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Title
>;
const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
	({ className, ...props }, ref) => (
		<AlertDialogPrimitive.Title
			ref={ref}
			className={cn("text-lg font-semibold", className)}
			{...props}
		/>
	),
);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

type AlertDialogDescriptionProps = ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Description
>;
const AlertDialogDescription = forwardRef<
	HTMLParagraphElement,
	AlertDialogDescriptionProps
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground", className)}
		{...props}
	/>
));
AlertDialogDescription.displayName =
	AlertDialogPrimitive.Description.displayName;

type AlertDialogActionProps = ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Action
>;
const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
	({ className, ...props }, ref) => (
		<AlertDialogPrimitive.Action
			ref={ref}
			className={cn(buttonVariants(), className)}
			{...props}
		/>
	),
);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

type AlertDialogCancelProps = ComponentPropsWithoutRef<
	typeof AlertDialogPrimitive.Cancel
>;
const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
	({ className, ...props }, ref) => (
		<AlertDialogPrimitive.Cancel
			ref={ref}
			className={cn(
				buttonVariants({ variant: "outline" }),
				"mt-2 sm:mt-0",
				className,
			)}
			{...props}
		/>
	),
);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
};
