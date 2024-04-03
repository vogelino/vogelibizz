import BizzLogo from '@components/BizzLogo'
import LogoutButton from '@components/LogoutButton'
import ThemeToggle from '@components/ThemeToggle'
import { cn } from '@utility/classNames'
import Link from 'next/link'
import HeaderMenuLink from './HeaderMenuLink'

export const Menu = ({
	withBg = true,
	currentPage = '',
}: {
	withBg?: boolean
	currentPage: string
}) => {
	const menuItems = [
		{
			key: 'projects',
			label: 'Projects',
			route: '/projects',
		},
		{
			key: 'clients',
			label: 'Clients',
			route: '/clients',
		},
		{
			key: 'expenses',
			label: 'Expenses',
			route: '/expenses',
		},
	]

	const withBgClasses = 'bg-bg border-grayMed'
	const withoutBgClasses = 'border-b-transparent'
	return (
		<header
			aria-label="Main header"
			className={cn(
				!withBg && `logo-visible`,
				`absolute top-0 left-1/2 -translate-x-1/2 w-screen z-40`,
				`text-fg px-10`,
				`border-b`,
				`flex justify-between items-center py-2`,
				`scrolled-top h-auto`,
				`transition motion-reduce:transition-none`,
				withBg ? withBgClasses : withoutBgClasses,
			)}
		>
			<Link
				href="/projects"
				className={cn(
					'group',
					'px-4 -ml-4 py-2 rounded-full',
					'focus:outline-none focus:ring-2 focus:ring-fg',
				)}
			>
				<BizzLogo textClassName="group-hover:text-alt" />
			</Link>
			<button
				aria-label="Hide the main navitation menu"
				id="burger-menu"
				aria-hidden="false"
				aria-expanded="false"
				className="md:hidden md:invisible"
			>
				<span></span>
			</button>
			<nav
				id="menu"
				aria-label="Main navigation"
				className={cn(
					`fixed top-[101px] left-0 w-screen h-[calc(100svh-69px)] bg-bg md:bg-transparent`,
					`opacity-0 pointer-events-none md:opacity-100 md:static md:pointer-events-auto`,
					`md:w-auto md:h-auto md:bg-none transition-opacity`,
					`motion-reduce:transition-none`,
				)}
			>
				<ul
					className={cn(`flex flex-col md:flex-row md:gap-4 items-center`)}
					aria-label="Main menu items"
				>
					{menuItems.map((item) => (
						<HeaderMenuLink
							key={item.key}
							href={item.route ?? '/'}
							title={item.label ?? '-'}
							active={currentPage.split('/')[0] === item.key}
						/>
					))}
					<LogoutButton />
					<li
						aria-label="Main menu link: Other actions"
						className={cn(
							`w-full md:w-auto py-5 md:p-0 text-grayDark`,
							`flex justify-between items-center pr-5 md:pr-0`,
						)}
					>
						<div className="text-fg inline-flex items-center">
							<ThemeToggle />
						</div>
					</li>
				</ul>
			</nav>
		</header>
	)
}
