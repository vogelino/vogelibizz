'use client'
import { PropsWithChildren, ReactNode } from 'react'
import { Breadcrumb } from '../breadcrumb'
import { Menu } from '../menu'
import Footer from '@components/Footer'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

export const Layout: React.FC<
	PropsWithChildren<{
		modal?: ReactNode
	}>
> = ({ modal = null, children }) => {
	const pathname = usePathname()
	console.log(pathname)
	return (
		<>
			<div className="layout pt-[101px]">
				<Menu currentPage={pathname.replace(/^\//, '')} />
				<div className="content min-h-[calc(100vh-101px-83px)]">
					{!modal && <Breadcrumb />}
					<div>{children}</div>
				</div>
				<Footer />
			</div>
			{modal}
		</>
	)
}
