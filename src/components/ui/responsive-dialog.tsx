"use client";
import type * as React from "react";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/utility/classNames";
import useMediaQuery from "@custom-react-hooks/use-media-query";

export function ResponsiveModal({
	children,
	title,
	description,
	footer,
	onClose,
	open,
}: React.PropsWithChildren<{
	open: boolean;
	title?: React.ReactNode;
	description?: React.ReactNode;
	footer?: React.ReactNode;
	onClose?: () => void;
}>) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	return (
		<Drawer
			open={open}
			direction={isDesktop ? "right" : "bottom"}
			onOpenChange={(open) => !open && onClose && onClose()}
			activeSnapPoint={isDesktop ? undefined : 0}
		>
			<DrawerContent
				className={cn(
					`border-grayMed`,
					isDesktop ? "border-l" : "border-t",
					isDesktop
						? "h-full w-[640px] mt-24 right-0"
						: `inset-x-0 z-50 mt-24 flex h-auto`,
				)}
			>
				{isDesktop ? null : (
					<div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-grayMed" />
				)}
				{(title || description) && (
					<DrawerHeader className="text-left">
						{title && <DrawerTitle>{title}</DrawerTitle>}
						{description && (
							<DrawerDescription>{description}</DrawerDescription>
						)}
					</DrawerHeader>
				)}
				<div
					className={cn(
						"p-6 overflow-auto",
						isDesktop ? "h-[calc(100vh-208px)]" : "h-[calc(100%-208px)]",
					)}
				>
					{children}
				</div>
				{footer && <DrawerFooter>{footer}</DrawerFooter>}
			</DrawerContent>
		</Drawer>
	);
}
