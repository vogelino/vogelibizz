import { cn } from '@utility/classNames'
import Link from 'next/link'
import React, { ReactElement } from 'react'

function HeaderMenuLink({
	as = Link,
	onClick,
	href,
	title,
	className,
	active,
}: {
	as?: typeof Link | string
	onClick?: () => void
	href?: string
	title: string
	className?: string
	active?: boolean
}) {
	const Tag = as
	return (
		<li
			className="inline-block w-full sm:w-auto"
			aria-label={`Main menu Link: ${title}`}
		>
			<Tag
				href={href ?? '/'}
				aria-label={`Header menu link: ${title} page`}
				className={cn(
					className,
					`uppercase sm:normal-case text-3xl tracking-wide`,
					`pb-5 px-6 border-b border-grayLight antialiased`,
					`sm:tracking-normal sm:border-none sm:py-1 transition-colors`,
					`inline-block w-screen sm:w-auto sm:rounded-full`,
					`focus-visible:ring-2 focus-visible:ring-fg outline-none`,
					!active && [`pt-6 sm:text-xl hover:bg-alt sm:px-4 sm:pt-2`],
					active && [
						`text-4xl pt-4`,
						`font-special bg-alt sm:text-[26px] sm:px-3 sm:pb-1 sm:pt-0`,
					],
				)}
				tabIndex={active ? -1 : 0}
				onClick={onClick}
			>
				{title}
			</Tag>
		</li>
	)
}

export default HeaderMenuLink
