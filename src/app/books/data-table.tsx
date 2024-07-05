'use client'
import * as React from 'react'
import {
	ColumnDef,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	useReactTable,
	Row,
	FilterFn,
} from '@tanstack/react-table'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Book {
	id: number
	title: string
	isbn: string
	author: string
	published_date: string
	purchased_date?: string
	purchase_location?: string
	read: boolean
	reader?: string
	location?: string
}

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[]
	data: TData[]
}

const globalFilterFn: FilterFn<Book> = (
	row: Row<Book>,
	columnId: string,
	filterValue: string
): boolean => {
	if (!filterValue) return true // Show all rows if no filter is applied

	const filterWords = filterValue.toLowerCase().split(/\s+/)

	// Initialize readFiltered as null to determine if 'read' or 'unread' logic was applied
	let readFiltered: boolean | null = null

	// Filter out 'read' and 'unread' keywords and process them separately
	const otherFilterWords = filterWords.filter((word) => {
		if (word.startsWith('rea') && row.original.read) {
			readFiltered = true // Matches 'read'
			return false // Remove this word from further general filtering
		} else if (word.startsWith('un') && !row.original.read) {
			readFiltered = true // Matches 'unread'
			return false // Remove this word from further general filtering
		}
		return true // Keep the word for further processing
	})

	// If 'read' or 'unread' logic was applied and resulted in 'false', exit early
	if (readFiltered === false) return false

	// Combine attributes into a single string for other keyword checks
	const rowValues = [
		row.original.title,
		row.original.author,
		row.original.isbn,
		row.original.reader,
		row.original.purchased_date,
		row.original.purchase_location,
		row.original.location,
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase()

	// Check if all remaining words are included in the row values
	const otherWordsFiltered = otherFilterWords.every((word) =>
		rowValues.includes(word)
	)

	// Return true only if readFiltered is not contradicted and other words are filtered correctly
	return readFiltered !== false && otherWordsFiltered
}

export function DataTable({ columns, data }: DataTableProps<Book>) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = React.useState('')
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		globalFilterFn: globalFilterFn,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			globalFilter,
			columnVisibility,
		},
	})

	return (
		<div>
			<div className="flex items-center py-4">
				<Input
					placeholder="Search books..."
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}>
										{column.id}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader className="">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="text-center bg-gray-50">
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} className="text-center">
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="text-center"
									data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}
