'use client'

import { useNavigation } from '@refinedev/core'
import { useTable } from '@refinedev/react-table'
import { ColumnDef, flexRender } from '@tanstack/react-table'
import React, { useMemo } from 'react'
import { projectTableColumns } from './columns'
import { useActionsColumn } from '@utility/useActionsColumn'
import { ProjectType } from '@db/schema'
import { DataTable } from '@components/DataTable'
import { Button } from '@components/ui/button'

const RESOURCE_NAME = 'projects'
export default function ProjectList() {
	const { create } = useNavigation()
	const actions = useActionsColumn<ProjectType>(RESOURCE_NAME)

	const columns = [...projectTableColumns, actions]

	const {
		setOptions,
		refineCore: {
			tableQueryResult: { data: tableData },
		},
		getState,
		setPageIndex,
		getCanPreviousPage,
		getPageCount,
		getCanNextPage,
		nextPage,
		previousPage,
		setPageSize,
	} = useTable({
		columns,
		refineCoreProps: {
			meta: {
				select: '*',
			},
		},
	})
	console.log(tableData)

	setOptions((prev) => ({
		...prev,
		meta: {
			...prev.meta,
		},
	}))

	return (
		<div className="px-10">
			<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
				<h1 className="font-special text-3xl antialiased">All projects</h1>
				<Button onClick={() => create(RESOURCE_NAME)}>{'New project'}</Button>
			</div>
			<div className="w-full overflow-auto">
				{tableData && <DataTable columns={columns} data={tableData.data} />}
			</div>
			<div style={{ marginTop: '12px' }}>
				<button
					onClick={() => setPageIndex(0)}
					disabled={!getCanPreviousPage()}
				>
					{'<<'}
				</button>
				<button onClick={() => previousPage()} disabled={!getCanPreviousPage()}>
					{'<'}
				</button>
				<button onClick={() => nextPage()} disabled={!getCanNextPage()}>
					{'>'}
				</button>
				<button
					onClick={() => setPageIndex(getPageCount() - 1)}
					disabled={!getCanNextPage()}
				>
					{'>>'}
				</button>
				<span>
					<strong>
						{' '}
						{getState().pagination.pageIndex + 1} / {getPageCount()}{' '}
					</strong>
				</span>
				<span>
					| {'Go'}:{' '}
					<input
						type="number"
						defaultValue={getState().pagination.pageIndex + 1}
						onChange={(e) => {
							const page = e.target.value ? Number(e.target.value) - 1 : 0
							setPageIndex(page)
						}}
					/>
				</span>{' '}
				<select
					value={getState().pagination.pageSize}
					onChange={(e) => {
						setPageSize(Number(e.target.value))
					}}
				>
					{[10, 20, 30, 40, 50].map((pageSize) => (
						<option key={pageSize} value={pageSize}>
							{'Show'} {pageSize}
						</option>
					))}
				</select>
			</div>
		</div>
	)
}
