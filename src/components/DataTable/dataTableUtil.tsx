import { Button } from '@components/ui/button'
import { BaseRecord } from '@refinedev/core'
import { ColumnDefTemplate, HeaderContext } from '@tanstack/react-table'
import { cn } from '@utility/classNames'
import { ArrowDownAZ, ArrowUpDown, ArrowUpZA } from 'lucide-react'
import { ReactNode } from 'react'

type ColumnHeaderFunction<P extends BaseRecord> = ColumnDefTemplate<
	HeaderContext<P, unknown>
>

export function getSortableHeaderTemplate<P extends BaseRecord>(
	label: ReactNode,
) {
	const templateFunction: ColumnHeaderFunction<P> = ({ column }) => {
		const sort = column.getIsSorted()
		const iconClass = cn('ml-2 h-4 w-4', sort && 'text-fg')
		return (
			<Button
				variant="ghost"
				onClick={() => {
					if (sort === 'desc') return column.clearSorting()
					column.toggleSorting(sort === 'asc')
				}}
				className={cn('-ml-4 hover:text-fg group')}
			>
				{label}
				{!sort && <ArrowUpDown className={iconClass} />}
				{sort === 'asc' && <ArrowDownAZ className={iconClass} />}
				{sort === 'desc' && <ArrowUpZA className={iconClass} />}
			</Button>
		)
	}
	return templateFunction
}
