import React from 'react'
import { cn } from '@utility/classNames'

type BizzLogoProps = {
	className?: string
	textClassName?: string
	color?: 'fg' | 'grayDark'
}
function BizzLogo({ className, textClassName, color = 'fg' }: BizzLogoProps) {
	return (
		<span
			className={cn(
				color === 'fg' && 'text-fg',
				color === 'grayDark' && 'text-grayDark',
				'font-special text-3xl inline-block',
				'antialiased transition-colors',
				'relative w-fit pr-[4.5rem]',
				className,
			)}
		>
			<span
				className={cn(
					'text-bg text-strokewidth-4 select-none pointer-events-none',
					color === 'fg' && 'text-stroke-fg',
					color === 'grayDark' && 'text-stroke-grayDark',
				)}
				aria-hidden="true"
			>
				Vogeli
			</span>
			<span className="font-sans inline-block absolute top-1.5 right-0 font-bold">
				BIZZ
			</span>
			<span className={cn('absolute top-0 left-0 text-bg', textClassName)}>
				Vogeli
			</span>
		</span>
	)
}

export default BizzLogo
