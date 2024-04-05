import { cn } from '@utility/classNames'
import { PropsWithChildren } from 'react'

export function PillText({
	children,
	pillColorClass,
}: PropsWithChildren<{ pillColorClass: string }>) {
	return (
		<>
			<span
				className={cn(
					`size-3 rounded-full items-center inline-block`,
					pillColorClass,
				)}
			/>
			<span className="pt-1">{children}</span>
		</>
	)
}
