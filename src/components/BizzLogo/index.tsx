import React from 'react'
import styles from './bizz-logo.module.css'
import { cn } from '@utility/classNames'

type BizzLogoProps = {
	className?: string
}
function BizzLogo({ className }: BizzLogoProps) {
	return (
		<span
			className={cn(
				'font-special text-3xl inline-block text-bg',
				'antialiased transition-colors',
				styles.logo,
				className,
			)}
		>
			bizz
		</span>
	)
}

export default BizzLogo
