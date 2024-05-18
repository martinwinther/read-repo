'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchBooks, Book } from '@/lib/utils'

export default function Home() {
	const [query, setQuery] = useState<string>('')
	const [books, setBooks] = useState<Book[]>([])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleSearch = async () => {
		if (query.trim()) {
			const result = await fetchBooks(query)
			setBooks(result)
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div>
				<Image
					className="py-8"
					src="/heroImage.png"
					alt="logo"
					width={500}
					height={500}
				/>
				<Input
					type="text"
					placeholder="Add a book"
					value={query}
					onChange={handleInputChange}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<Button onClick={handleSearch} className="mt-4">
					Search
				</Button>
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
										<Button className="ml-4">Add</Button>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p>No books found</p>
					)}
				</div>
			</div>
		</main>
	)
}
