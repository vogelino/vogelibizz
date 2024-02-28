import React from 'react'
import { cn } from '@utility/classNames'

type BizzLogoProps = {
	className?: string
	textClassName?: string
}
function BizzLogo({ className, textClassName }: BizzLogoProps) {
	return (
		<span
			className={cn(
				'font-special text-3xl inline-block',
				'antialiased transition-colors',
				'relative w-fit pr-[4.5rem]',
				className,
			)}
		>
			<span
				className="text-bg text-stroke-4 select-none pointer-events-none text-stroke-line"
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
