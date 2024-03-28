'use client'
import Footer from '@components/Footer'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, ReactNode } from 'react'
import { Breadcrumb } from '../breadcrumb'
import { Menu } from '../menu'

export const PageLayout: React.FC<
	PropsWithChildren<{
		modal?: ReactNode
	}>
> = ({ modal = null, children }) => {
	const pathname = usePathname()
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
