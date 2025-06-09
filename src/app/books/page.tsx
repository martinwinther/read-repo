'use client'

import { useEffect, useState, useCallback } from 'react'
import { getUserBooks, Book } from '@/lib/booksService'
import { DataTable } from './data-table'
import { columns, BooksRefreshContext } from './columns'
import { Toaster } from 'sonner'
import { BookTableSkeleton } from '@/components/ui/loading-states'
import { EmptyState } from '@/components/ui/empty-state'
import { BookOpen, Plus, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Books() {
	const [books, setBooks] = useState<Book[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const loadBooks = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const userBooks = await getUserBooks()
			setBooks(userBooks)
		} catch (error) {
			console.error('Failed to load books:', error)
			setError('Failed to load your books. Please try again.')
			toast.error('Failed to load books')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadBooks()
	}, [loadBooks])

	// Show loading skeleton on initial load
	if (loading && books.length === 0) {
		return (
			<div className="container mx-auto py-10">
				<BookTableSkeleton />
			</div>
		)
	}

	// Show error state
	if (error && books.length === 0) {
		return (
			<div className="container mx-auto py-10">
				<EmptyState
					icon={AlertCircle}
					title="Unable to load books"
					description={error}
					action={{
						label: "Try again",
						onClick: loadBooks
					}}
				/>
			</div>
		)
	}

	// Show empty state when no books exist
	const filteredBooks = books.filter((book): book is Required<Book> => !!book.isbn)
	if (!loading && filteredBooks.length === 0) {
		return (
			<div className="container mx-auto py-10">
				<Toaster position="bottom-right" />
				<EmptyState
					icon={BookOpen}
					title="No books in your collection"
					description="Start building your library by adding your first book. Search by title, author, or ISBN to get started."
					action={{
						label: "Add your first book",
						onClick: () => router.push('/add')
					}}
				/>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-10">
			<Toaster position="bottom-right" />
			<BooksRefreshContext.Provider value={loadBooks}>
				<DataTable 
					columns={columns as any} 
					data={filteredBooks}
					loading={loading}
				/>
			</BooksRefreshContext.Provider>
		</div>
	)
}
