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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BooksRefreshContext } from './columns'
import { EmptyState } from '@/components/ui/empty-state'
import { BookSearchSkeleton, InlineLoader } from '@/components/ui/loading-states'
import { Search, BookOpen, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { deleteBook } from '@/lib/booksService'
import { toast } from 'sonner'
import { EditBookDialog } from './EditBookDialog'

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
	user_id: string
}

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[]
	data: TData[]
	loading?: boolean
}

// Card component for mobile view
function BookCard({ book }: { book: Book }) {
	const [editDialogOpen, setEditDialogOpen] = React.useState(false)
	const [showDetails, setShowDetails] = React.useState(false)
	const refreshBooks = React.useContext(BooksRefreshContext)

	const handleDelete = async () => {
		if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
			try {
				await deleteBook(book.id)
				toast.success(`"${book.title}" deleted successfully`)
				refreshBooks()
			} catch (error) {
				console.error('Error deleting book:', error)
				toast.error('Failed to delete book')
			}
		}
	}

	const openGoogleBooks = () => {
		if (!book.isbn) {
			toast.error("This book doesn't have an ISBN to search with")
			return
		}
		const cleanIsbn = book.isbn.replace(/-/g, '')
		const url = `https://books.google.com/books?isbn=${cleanIsbn}`
		window.open(url, '_blank', 'noopener,noreferrer')
	}

	return (
		<>
			<Card className="w-full bg-card backdrop-blur-sm border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
				<CardHeader className="pb-3">
					<div className="flex items-start gap-3">
						<div className="flex-1 min-w-0">
							<CardTitle className="text-base font-semibold leading-tight mb-1 text-foreground line-clamp-2">
								{book.title}
							</CardTitle>
							<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
								{book.author || 'Unknown author'}
							</p>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent/80 shrink-0">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
								<DropdownMenuItem 
									onSelect={() => {
										navigator.clipboard.writeText(book.isbn || '')
										toast.success('ISBN copied to clipboard')
									}}>
									Copy ISBN
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
									Edit book
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={handleDelete} className="text-destructive">
									Delete book
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={openGoogleBooks}>
									View on Google Books
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					
					<div className="flex flex-wrap gap-1.5">
						<Badge 
							variant={book.read ? "default" : "secondary"} 
							className="rounded-full px-2.5 py-0.5 text-xs font-medium"
						>
							{book.read ? "Read" : "Unread"}
						</Badge>
						{book.location && (
							<Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
								{book.location}
							</Badge>
						)}
						{book.reader && book.reader !== book.author && (
							<Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
								Reader: {book.reader}
							</Badge>
						)}
					</div>
				</CardHeader>
				
				<CardContent className="pt-0 space-y-2">
					{book.published_date && (
						<div className="flex justify-between items-center py-1.5 border-b border-border/40">
							<span className="text-xs text-muted-foreground font-medium">Published</span>
							<span className="text-xs font-medium">{book.published_date}</span>
						</div>
					)}
					{book.purchased_date && (
						<div className="flex justify-between items-center py-1.5 border-b border-border/40">
							<span className="text-xs text-muted-foreground font-medium">Purchased</span>
							<span className="text-xs font-medium">{book.purchased_date}</span>
						</div>
					)}
					{book.purchase_location && (
						<div className="flex justify-between items-center py-1.5 border-b border-border/40">
							<span className="text-xs text-muted-foreground font-medium">From</span>
							<span className="text-xs font-medium truncate ml-2">{book.purchase_location}</span>
						</div>
					)}
					
					{book.isbn && (
						<div className="flex justify-between items-center py-1.5">
							<span className="text-xs text-muted-foreground font-medium">ISBN</span>
							<span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-xs">{book.isbn}</span>
						</div>
					)}
				</CardContent>
			</Card>
			
			<EditBookDialog 
				book={book} 
				open={editDialogOpen} 
				onOpenChange={setEditDialogOpen}
				onBookUpdated={refreshBooks}
			/>
		</>
	)
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

export function DataTable({ columns, data, loading = false }: DataTableProps<Book>) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = React.useState('')
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})
	const router = useRouter()

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

	const filteredRows = table.getRowModel().rows

	// Empty state for search results
	const searchEmpty = globalFilter && filteredRows.length === 0

	return (
		<div className="w-full">
			{/* Search and Controls */}
			<div className="flex items-center gap-3 mb-6 px-1">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search books..."
						value={globalFilter}
						onChange={(event) => setGlobalFilter(event.target.value)}
						className="pl-10 bg-background/80 backdrop-blur-sm"
					/>
				</div>
				{/* Hide column selector on mobile since cards don't use it */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="hidden md:flex shrink-0">
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

			{/* Mobile Card View */}
			<div className="md:hidden">
				<div className="space-y-3 px-1">
					{loading ? (
						<BookSearchSkeleton />
					) : searchEmpty ? (
						<EmptyState
							icon={Search}
							title="No books found"
							description={`No books match "${globalFilter}". Try adjusting your search terms.`}
							className="py-12"
						/>
					) : filteredRows?.length ? (
						filteredRows.map((row) => (
							<BookCard key={row.id} book={row.original} />
						))
					) : (
						<EmptyState
							icon={BookOpen}
							title="No books yet"
							description="Add your first book to get started with your library."
							action={{
								label: "Add a book",
								onClick: () => router.push('/add')
							}}
							className="py-12"
						/>
					)}
				</div>
			</div>

			{/* Desktop Table View */}
			<div className="hidden md:block">
				<div className="rounded-lg border bg-card overflow-hidden">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/40">
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} className="text-center font-semibold">
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
							{loading ? (
								// Loading skeleton rows
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										{columns.map((_, j) => (
											<TableCell key={j} className="text-center">
												<div className="h-4 bg-muted/50 rounded animate-pulse" />
											</TableCell>
										))}
									</TableRow>
								))
							) : searchEmpty ? (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-48">
										<EmptyState
											icon={Search}
											title="No books found"
											description={`No books match "${globalFilter}". Try adjusting your search terms.`}
											className="py-8"
										/>
									</TableCell>
								</TableRow>
							) : filteredRows?.length ? (
								filteredRows.map((row) => (
									<TableRow
										key={row.id}
										className="text-center hover:bg-muted/20"
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
									<TableCell colSpan={columns.length} className="h-48">
										<EmptyState
											icon={BookOpen}
											title="No books in your collection"
											description="Start building your library by adding your first book."
											action={{
												label: "Add your first book",
												onClick: () => router.push('/add')
											}}
											className="py-8"
										/>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Pagination */}
			{!loading && filteredRows?.length > 0 && (
				<div className="flex items-center justify-center gap-3 py-6 px-1">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="px-4">
						Previous
					</Button>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>Page</span>
						<span className="font-medium text-foreground">
							{table.getState().pagination.pageIndex + 1}
						</span>
						<span>of</span>
						<span className="font-medium text-foreground">
							{table.getPageCount()}
						</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="px-4">
						Next
					</Button>
				</div>
			)}
		</div>
	)
}
