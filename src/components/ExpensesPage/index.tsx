'use client'

import { DataTable } from '@components/DataTable'
import { Button } from '@components/ui/button'
import { type ExpenseType } from '@db/schema'
import { useNavigation } from '@refinedev/core'
import { useTable } from '@refinedev/react-table'
import { getValueInCLPPerMonth, type RatesTypes } from '@utility/expensesUtil'
import { useActionsColumn } from '@utility/useActionsColumn'
import { useDefaultSort } from '@utility/useDefaultSort'
import { useMemo } from 'react'
import { getExpensesTableColumns } from '../../app/expenses/columns'

const RESOURCE_NAME = 'expenses'
export default function ExpensesPage({ rates }: { rates: RatesTypes }) {
	const { create } = useNavigation()
	const actions = useActionsColumn<ExpenseType>(RESOURCE_NAME)

	const columns = useMemo(
		() => [...getExpensesTableColumns(rates), actions],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	const table = useTable({
		columns,
		refineCoreProps: {
			resource: 'expenses',
			meta: {
				select: '*',
			},
			pagination: { pageSize: 1000 },
		},
	})
	const {
		setOptions,
		setSorting,
		refineCore: {
			tableQueryResult: { data: tableData },
		},
	} = table

	setOptions((prev) => ({
		...prev,
		meta: {
			...prev.meta,
		},
	}))

	useDefaultSort({ setSorting, defaultColumnId: 'last_modified' })

	const totalPerMonth = useMemo(() => {
		return tableData?.data
			.reduce((a, b) => {
				const monthlyPrice = getValueInCLPPerMonth({
					value: b.price,
					currency: b.original_currency,
					rates,
					billingRate: b.rate,
				})
				return a + (monthlyPrice ?? 0)
			}, 0)
			.toLocaleString('en-US', {
				style: 'currency',
				currency: 'CLP',
			})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tableData])

	return (
		<div className="px-10 pb-8">
			<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
				<h1 className="font-special text-3xl antialiased">{RESOURCE_NAME}</h1>
				<Button variant="outline" onClick={() => create(RESOURCE_NAME)}>
					New {RESOURCE_NAME.toLocaleLowerCase().replace(/s$/, '')}
				</Button>
			</div>
			<div className="flex gap-4 py-4 border-y border-grayLight my-4">
				<strong>Total per month:</strong>
				<span>{totalPerMonth}</span>
			</div>
			<div className="w-full overflow-auto mb-6">
				{tableData && <DataTable table={table} />}
			</div>
		</div>
	)
}
