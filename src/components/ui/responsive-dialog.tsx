"use client";
import { useMediaQuery } from "@custom-react-hooks/use-media-query";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/utility/classNames";

export function ResponsiveModal({
	children,
	title,
	description,
	footer,
	onClose,
	open: openProp,
}: React.PropsWithChildren<{
	open: boolean;
	title?: React.ReactNode;
	description?: React.ReactNode;
	footer?: React.ReactNode;
	onClose?: () => void;
}>) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [open, setOpen] = useState(openProp);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	const isClosingRef = useRef(false);

	useEffect(() => {
		setOpen(openProp);
	}, [openProp]);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setOpen(false);
			isClosingRef.current = true;
		}
	};

	const handleAnimationEnd = () => {
		if (isClosingRef.current) {
			isClosingRef.current = false;
			onCloseRef.current?.();
		}
	};

	return (
		<Drawer
			open={open}
			direction={isDesktop ? "right" : "bottom"}
			onOpenChange={handleOpenChange}
			activeSnapPoint={isDesktop ? undefined : 0}
		>
			<DrawerContent
				onAnimationEnd={handleAnimationEnd}
				className={cn(
					"border-border",
					isDesktop ? "border-l" : "border-t",
					isDesktop
						? "h-full w-160 mt-24 right-0"
						: `inset-x-0 z-50 mt-24 flex h-auto`,
				)}
			>
				{isDesktop ? null : <div className="mx-auto mt-4 h-2 w-25 bg-border" />}
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
