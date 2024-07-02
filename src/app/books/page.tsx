'use client'
import { Button } from '@/components/ui/button'
import { Book } from '@/lib/utils'
import { useState } from 'react'

export default function Books() {
	const [books, setBooks] = useState<Book[]>([])
	function handleAddClick(book: Book): void {
		throw new Error('Function not implemented.')
	}

	return (
		<div className="mt-8">
			{books.length > 0 ? (
				<ul>
					{books.map((book) => (
						<li key={book.id} className="mb-4">
							<h3 className="text-xl font-bold">{book.volumeInfo.title}</h3>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-700">
										{book.volumeInfo.authors?.join(', ')}
									</p>
									<p className="text-gray-500">
										{book.volumeInfo.publishedDate}
									</p>
								</div>
								<Button className="ml-4" onClick={() => handleAddClick(book)}>
									Add
								</Button>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p>No books found</p>
			)}
		</div>
	)
}
