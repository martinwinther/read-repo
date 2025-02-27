'use client'

import { useEffect, useState } from 'react'
import { getUserBooks, Book } from '@/lib/booksService'
import { DataTable } from './data-table'
import { columns } from './columns'

export default function Books() {
	const [books, setBooks] = useState<Book[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadBooks() {
			try {
				const userBooks = await getUserBooks()
				setBooks(userBooks)
			} catch (error) {
				console.error('Failed to load books:', error)
			} finally {
				setLoading(false)
			}
		}

		loadBooks()
	}, [])

	if (loading) {
		return <div>Loading books...</div>
	}

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={books.filter((book): book is Required<Book> => !!book.isbn)} />
		</div>
	)
}
