'use client'

import { PropsWithChildren } from 'react'
import { Breadcrumb } from '../breadcrumb'
import { Menu } from '../menu'

export const Layout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
	return (
		<div className="layout pt-[101px]">
			<Menu />
			<div className="content">
				<Breadcrumb />
				<div>{children}</div>
			</div>
		</div>
	)
}
