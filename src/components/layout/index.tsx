'use client'

import { PropsWithChildren } from 'react'
import { Breadcrumb } from '../breadcrumb'
import { Menu } from '../menu'
import Footer from '@components/Footer'

export const Layout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
	return (
		<div className="layout pt-[101px]">
			<Menu />
			<div className="content min-h-[calc(100vh-101px-83px)]">
				<Breadcrumb />
				<div>{children}</div>
			</div>
			<Footer />
		</div>
	)
}
