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

// Create a context for refresh functionality
export const BooksRefreshContext = React.createContext<() => void>(() => {});

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
			return <div>{row.original.author || <span className="text-gray-400">Unknown author</span>}</div>
		}
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
			return <div>{row.original.isbn || <span className="text-gray-400">No ISBN</span>}</div>
		}
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
			return <div>{row.original.published_date || <span className="text-gray-400">Unknown date</span>}</div>
		}
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
			return <div>{row.original.purchased_date || <span className="text-gray-400">Not recorded</span>}</div>
		}
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
			return <div>{row.original.purchase_location || <span className="text-gray-400">Unknown location</span>}</div>
		}
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
			return <div>{row.original.read ? 'Yes' : 'No'}</div>
		}
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
			return <div>{row.original.reader || <span className="text-gray-400">No reader</span>}</div>
		}
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
			return <div>{row.original.location || <span className="text-gray-400">Not shelved</span>}</div>
		}
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const book = row.original;
			const refreshBooks = React.useContext(BooksRefreshContext);
			return <ActionsCell book={book} refreshBooks={refreshBooks} />;
		},
	},
]
