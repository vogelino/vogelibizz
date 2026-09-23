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
	wide = false,
}: React.PropsWithChildren<{
	open: boolean;
	wide?: boolean;
	title?: React.ReactNode;
	description?: React.ReactNode;
	footer?: React.ReactNode;
	onClose?: () => void;
}>) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [open, setOpen] = useState(openProp);
	const [hydrated, setHydrated] = useState(false);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	const isClosingRef = useRef(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

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

	// Drawer uses a portal and renders nothing on the server. Keep the form in
	// the initial HTML so direct links show the same table and side panel.
	if (!hydrated) {
		if (!openProp) return null;
		return (
			<div className="fixed inset-0 z-50" role="presentation">
				<div className="absolute inset-0 bg-black/50" />
				<div
					role="dialog"
					aria-modal="true"
					aria-label={typeof title === "string" ? title : undefined}
					className={cn(
						"absolute bottom-0 right-0 flex max-h-[90vh] w-full flex-col border-t border-border bg-background md:top-0 md:bottom-auto md:h-full md:max-h-none md:border-l md:border-t-0",
						wide ? "md:w-[min(95vw,1100px)]" : "md:w-160",
					)}
				>
					{(title || description) && (
						<div className="p-6 text-left">
							{title && <div className="text-lg font-semibold">{title}</div>}
							{description && <div>{description}</div>}
						</div>
					)}
					<div className="min-h-0 flex-1 overflow-auto p-6">{children}</div>
					{footer && (
						<div className="flex flex-wrap justify-end gap-2 border-t border-border p-6">
							{footer}
						</div>
					)}
				</div>
			</div>
		);
	}

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
						? wide
							? "h-full w-[min(95vw,1100px)] mt-24 right-0"
							: "h-full w-160 mt-24 right-0"
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
