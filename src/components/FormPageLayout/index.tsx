import React, { PropsWithChildren } from 'react'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { cn } from '@utility/classNames'
import { ListIcon } from 'lucide-react'
import Link from 'next/link'

function FormPageLayout({
	id,
	title,
	allLink,
	footerButtons,
	children,
}: PropsWithChildren<{
	id?: string
	title: string
	allLink: string
	footerButtons?: React.ReactNode
}>) {
	return (
		<div className="px-10 pb-8 max-w-3xl mx-auto">
			<div
				className={cn(
					'flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center',
					'border-b border-grayLight pb-6',
				)}
			>
				<h1 className="font-special text-3xl antialiased flex items-center gap-4">
					<span>{title}</span>
					{id && (
						<Badge variant="outline" className="font-mono mt-1">
							{id}
						</Badge>
					)}
				</h1>
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href={allLink}>
							<ListIcon />
							<span>See all</span>
						</Link>
					</Button>
				</div>
			</div>
			{children}

			{footerButtons && (
				<div className="flex justify-end gap-2 pt-6 mt-8 border-t border-grayLight">
					{footerButtons}
				</div>
			)}
		</div>
	)
}

export default FormPageLayout
