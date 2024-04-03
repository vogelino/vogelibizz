import { getSortableHeaderTemplate } from '@components/DataTable/dataTableUtil'
import { IconBadge } from '@components/ui/icon-badge'
import InternalLink from '@components/ui/internal-link'
import { type ExpenseType } from '@db/schema'
import { ColumnDef } from '@tanstack/react-table'
import {
	categoryToColorClass,
	getValueInCLPPerMonth,
	mapTypeToIcon,
	typeToColorClass,
} from '@utility/expensesUtil'

export const getExpensesTableColumns = (
	rates: null | Record<ExpenseType['original_currency'], number>,
): ColumnDef<ExpenseType>[] => [
	{
		id: 'name',
		accessorKey: 'name',
		size: 1000,
		header: getSortableHeaderTemplate<ExpenseType>('Name'),
		cell: function render({ getValue, row }) {
			const id = row.original.id
			const value = getValue<string>()
			return <InternalLink href={`/expenses/show/${id}`}>{value}</InternalLink>
		},
	},
	{
		id: 'monthly_price_clp',
		accessorFn: (row) =>
			getValueInCLPPerMonth({
				value: row.price,
				currency: row.original_currency,
				rates,
				billingRate: row.rate,
			}) ?? 0,
		size: 100,
		header: getSortableHeaderTemplate<ExpenseType>('CLP/Month'),
		cell: function render({ getValue, row }) {
			let value = getValue<ExpenseType['price']>()
			return (
				<span>
					{value?.toLocaleString('en-US', {
						style: 'currency',
						currency: 'CLP',
					})}
				</span>
			)
		},
	},
	{
		id: 'price',
		accessorKey: 'price',
		size: 100,
		header: getSortableHeaderTemplate<ExpenseType>('Original price'),
		cell: function render({ getValue, row }) {
			const currency = row.original.original_currency
			const value = getValue<ExpenseType['price']>()
			return (
				<span>
					{value.toLocaleString('en-US', {
						style: 'currency',
						currency: currency,
					})}
				</span>
			)
		},
	},
	{
		id: 'rate',
		accessorKey: 'rate',
		size: 100,
		header: getSortableHeaderTemplate<ExpenseType>('Billing Freq.'),
	},
	{
		id: 'category',
		accessorKey: 'category',
		size: 100,
		header: getSortableHeaderTemplate<ExpenseType>('Category'),
		cell: function render({ getValue }) {
			const value = getValue<ExpenseType['category']>()
			return (
				<IconBadge
					icon={null}
					label={value}
					className={categoryToColorClass(value)}
				/>
			)
		},
	},
	{
		id: 'type',
		accessorKey: 'type',
		size: 100,
		header: getSortableHeaderTemplate<ExpenseType>('Type'),
		cell: function render({ getValue }) {
			const value = getValue<ExpenseType['type']>()
			return (
				<IconBadge
					icon={mapTypeToIcon(value)}
					label={value}
					className={typeToColorClass(value)}
				/>
			)
		},
	},
]
