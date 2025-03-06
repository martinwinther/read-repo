'use client'

import { useEffect, useState, useCallback } from 'react'
import { getUserBooks, Book } from '@/lib/booksService'
import { DataTable } from './data-table'
import { columns, BooksRefreshContext } from './columns'
import { Toaster } from 'sonner'

export default function Books() {
	const [books, setBooks] = useState<Book[]>([])
	const [loading, setLoading] = useState(true)

	const loadBooks = useCallback(async () => {
		try {
			setLoading(true)
			const userBooks = await getUserBooks()
			setBooks(userBooks)
		} catch (error) {
			console.error('Failed to load books:', error)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadBooks()
	}, [loadBooks])

	if (loading && books.length === 0) {
		return <div>Loading books...</div>
	}

	return (
		<div className="container mx-auto py-10">
			<Toaster position="bottom-right" />
			<BooksRefreshContext.Provider value={loadBooks}>
				<DataTable 
					columns={columns as any} 
					data={books.filter((book): book is Required<Book> => !!book.isbn)} 
				/>
			</BooksRefreshContext.Provider>
		</div>
	)
}
