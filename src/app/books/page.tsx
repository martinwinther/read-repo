'use client'

// Assuming data.json is in the public folder or correctly placed to be imported directly
import data from '@/lib/data.json'
import { useEffect, useState } from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'

// Ensure your Book type matches the structure of your JSON data
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

export default function Books() {
	const [books, setBooks] = useState<Book[]>([])

	useEffect(() => {
		const loadData = async () => {
			// Simulate an async operation, e.g., fetching data from an API
			await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
			setBooks(data)
		}

		loadData()
	}, [])

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={data} />
		</div>
	)
}
