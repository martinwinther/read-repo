import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteBook } from '@/lib/booksService'
import { toast } from 'sonner'
import { EditBookDialog } from './EditBookDialog'
import { getBookLocationDisplay } from '@/lib/locationService'

// Create a context for refresh functionality
export const BooksRefreshContext = React.createContext<() => void>(() => {});

// Component for displaying book location (handles both legacy and hierarchical)
const LocationCell = ({ book }: { book: Book }) => {
	const [locationText, setLocationText] = React.useState<string>('Loading...')

	React.useEffect(() => {
		getBookLocationDisplay(book)
			.then(setLocationText)
			.catch(() => {
				// Fallback to legacy location or default text
				setLocationText(book.location || 'Not shelved')
			})
	}, [book.location, book.location_id])

	return (
		<div className="max-w-[120px] truncate" title={locationText}>
			{locationText}
		</div>
	)
}

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
	location?: string // legacy field
	location_id?: string // new hierarchical location
	user_id: string
}

// Component for the actions cell with edit & delete functionality
const ActionsCell = ({ book, refreshBooks }: { book: Book, refreshBooks: () => void }) => {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	
	const handleDelete = async () => {
		console.log('Delete button clicked for book:', book.title);
		if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
			try {
				await deleteBook(book.id);
				toast.success(`"${book.title}" deleted successfully`);
				refreshBooks(); // Refresh the books list
			} catch (error) {
				console.error('Error deleting book:', error);
				toast.error('Failed to delete book');
			}
		}
	};
	
	const openGoogleBooks = () => {
		console.log('Google Books button clicked for book:', book.title);
		if (!book.isbn) {
			toast.error("This book doesn't have an ISBN to search with");
			return;
		}
		
		// Simply use direct Google Books search by ISBN
		const cleanIsbn = book.isbn.replace(/-/g, ''); // Remove hyphens for better compatibility
		const url = `https://books.google.com/books?isbn=${cleanIsbn}`;
		window.open(url, '_blank', 'noopener,noreferrer');
	};
	
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem 
						onSelect={() => {
							navigator.clipboard.writeText(book.isbn || '');
							toast.success('ISBN copied to clipboard');
						}}>
						Copy ISBN
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
						Edit book
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={handleDelete}>
						Delete book
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={openGoogleBooks}>
						View on Google Books
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			
			<EditBookDialog 
				book={book} 
				open={editDialogOpen} 
				onOpenChange={setEditDialogOpen}
				onBookUpdated={refreshBooks}
			/>
		</>
	);
};

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Title
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			return (
				<div className="max-w-[200px] truncate font-medium" title={row.original.title}>
					{row.original.title}
				</div>
			)
		},
		size: 250,
	},
	{
		accessorKey: 'author',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Author
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const author = row.original.author || 'Unknown author'
			return (
				<div className="max-w-[150px] truncate" title={author}>
					{author}
				</div>
			)
		},
		size: 180,
	},
	{
		accessorKey: 'read',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Read
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			return (
				<div className="flex justify-center">
					{row.original.read ? (
						<span className="text-green-600 font-medium">✓ Yes</span>
					) : (
						<span className="text-muted-foreground">No</span>
					)}
				</div>
			)
		},
		size: 80,
	},
	{
		accessorKey: 'location',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Location
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			return <LocationCell book={row.original} />
		},
		size: 140,
	},
	{
		accessorKey: 'published_date',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Published
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const date = row.original.published_date
			return (
				<div className="text-sm">
					{date ? new Date(date).getFullYear() : 'Unknown'}
				</div>
			)
		},
		size: 100,
		enableHiding: true,
	},
	{
		accessorKey: 'isbn',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					ISBN
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const isbn = row.original.isbn
			return isbn ? (
				<div className="text-xs font-mono max-w-[100px] truncate" title={isbn}>
					{isbn}
				</div>
			) : (
				<span className="text-muted-foreground text-xs">No ISBN</span>
			)
		},
		size: 120,
		enableHiding: true,
	},
	{
		accessorKey: 'purchased_date',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Purchased
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const date = row.original.purchased_date
			return (
				<div className="text-sm">
					{date || <span className="text-muted-foreground">Not recorded</span>}
				</div>
			)
		},
		size: 110,
		enableHiding: true,
	},
	{
		accessorKey: 'purchase_location',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Purchased at
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const location = row.original.purchase_location || 'Unknown'
			return (
				<div className="max-w-[120px] truncate text-sm" title={location}>
					{location}
				</div>
			)
		},
		size: 140,
		enableHiding: true,
	},
	{
		accessorKey: 'reader',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Reader
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			const reader = row.original.reader || 'No reader'
			return (
				<div className="max-w-[100px] truncate text-sm" title={reader}>
					{reader}
				</div>
			)
		},
		size: 120,
		enableHiding: true,
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const book = row.original;
			return <ActionsCellWrapper book={book} />;
		},
		size: 80,
		enableHiding: false,
	},
]

// Create a proper React component that can use hooks
function ActionsCellWrapper({ book }: { book: Book }) {
	// Now we can use hooks in a proper component 
	const refreshBooks = React.useContext(BooksRefreshContext);
	return <ActionsCell book={book} refreshBooks={refreshBooks} />;
}
