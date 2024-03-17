'use client'
import * as React from 'react'

import useMediaQuery from '@custom-react-hooks/use-media-query'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer'

export function ResponsiveModal({
	children,
	title,
	description,
	footer,
	onClose,
	open,
}: React.PropsWithChildren<{
	open: boolean
	title?: React.ReactNode
	description?: React.ReactNode
	footer?: React.ReactNode
	onClose?: () => void
}>) {
	const isDesktop = useMediaQuery('(min-width: 768px)')

	if (isDesktop) {
		return (
			<Dialog
				open={open}
				onOpenChange={(open) => !open && onClose && onClose()}
			>
				<DialogContent className="sm:max-w-[425px]">
					{(title || description) && (
						<DialogHeader>
							{title && <DialogTitle>{title}</DialogTitle>}
							{description && (
								<DialogDescription>{description}</DialogDescription>
							)}
						</DialogHeader>
					)}
					<div className="p-6">{children}</div>
					{footer && <DialogFooter>{footer}</DialogFooter>}
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Drawer open={open} onOpenChange={(open) => !open && onClose && onClose()}>
			<DrawerContent>
				{(title || description) && (
					<DrawerHeader className="text-left">
						{title && <DrawerTitle>{title}</DrawerTitle>}
						{description && (
							<DrawerDescription>{description}</DrawerDescription>
						)}
					</DrawerHeader>
				)}
				<div className="px-4">{children}</div>
				{footer && <DrawerFooter>{footer}</DrawerFooter>}
			</DrawerContent>
		</Drawer>
	)
}
