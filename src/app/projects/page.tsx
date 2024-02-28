'use client'

import { useNavigation } from '@refinedev/core'
import { useTable } from '@refinedev/react-table'
import React from 'react'
import { projectTableColumns } from './columns'
import { useActionsColumn } from '@utility/useActionsColumn'
import { ProjectType } from '@db/schema'
import { DataTable } from '@components/DataTable'
import { Button } from '@components/ui/button'
import TablePagination from '@components/DataTable/table-pagination'

const RESOURCE_NAME = 'projects'
export default function ProjectList() {
	const { create } = useNavigation()
	const actions = useActionsColumn<ProjectType>(RESOURCE_NAME)

	const columns = [...projectTableColumns, actions]

	const table = useTable({
		columns,
		refineCoreProps: {
			meta: {
				select: '*',
			},
		},
	})
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
	} = table

	setOptions((prev) => ({
		...prev,
		meta: {
			...prev.meta,
		},
	}))

	return (
		<div className="px-10 pb-8">
			<div className="flex justify-between gap-x-6 gap-y-2 flex-wrap mb-4 items-center">
				<h1 className="font-special text-3xl antialiased">{RESOURCE_NAME}</h1>
				<Button variant="outline" onClick={() => create(RESOURCE_NAME)}>
					New {RESOURCE_NAME.toLocaleLowerCase().replace(/s$/, '')}
				</Button>
			</div>
			<div className="w-full overflow-auto mb-6">
				{tableData && <DataTable table={table} />}
			</div>
			<TablePagination
				getState={getState}
				setPageIndex={setPageIndex}
				getCanPreviousPage={getCanPreviousPage}
				getPageCount={getPageCount}
				getCanNextPage={getCanNextPage}
				nextPage={nextPage}
				previousPage={previousPage}
				setPageSize={setPageSize}
			/>
		</div>
	)
}
