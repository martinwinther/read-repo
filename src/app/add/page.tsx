'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchBooks, Book } from '@/lib/utils'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { toast, Toaster } from 'sonner'

interface BookWithLocation extends Book {
	location: string
}

export default function AddBook() {
	const [query, setQuery] = useState<string>('')
	const [books, setBooks] = useState<Book[]>([])
	const [openDialog, setOpenDialog] = useState<boolean>(false)
	const [selectedBook, setSelectedBook] = useState<Book | null>(null)
	const [locations, setLocations] = useState<string[]>([
		'Living Room',
		'Bedroom',
		'Office',
	])
	const [newLocation, setNewLocation] = useState<string>('')
	const [selectedLocation, setSelectedLocation] = useState<string>('')
	const [bookList, setBookList] = useState<BookWithLocation[]>([])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleSearch = async () => {
		if (query.trim()) {
			const result = await fetchBooks(query)
			setBooks(result)
		}
	}

	const handleAddClick = (book: Book) => {
		setSelectedBook(book)
		setOpenDialog(true)
	}

	const handleConfirm = () => {
		const location = newLocation || selectedLocation
		if (location && selectedBook) {
			const newBook = { ...selectedBook, location }
			setBookList([...bookList, newBook])
			if (newLocation) {
				setLocations([...locations, newLocation])
			}
			toast.success(`Book added to ${location}`)
			setOpenDialog(false)
			setSelectedBook(null)
			setNewLocation('')
			setSelectedLocation('')
		} else {
			toast.error('Please select or add a location')
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<Toaster position="bottom-right" />
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
			</div>

			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Book to a Location</DialogTitle>
						<DialogDescription>
							Select a location for this book or add a new one.
						</DialogDescription>
					</DialogHeader>
					{selectedBook && (
						<div className="mt-4">
							<h3 className="text-xl font-bold">
								{selectedBook.volumeInfo.title}
							</h3>
							<p className="text-gray-700">
								{selectedBook.volumeInfo.authors?.join(', ')}
							</p>
							<p className="text-gray-500">
								{selectedBook.volumeInfo.publishedDate}
							</p>
						</div>
					)}
					<div className="mt-4">
						<Select onValueChange={setSelectedLocation}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a location" />
							</SelectTrigger>
							<SelectContent>
								{locations.map((location, index) => (
									<SelectItem key={index} value={location}>
										{location}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Input
							type="text"
							placeholder="Add a new location"
							value={newLocation}
							onChange={(e) => setNewLocation(e.target.value)}
							className="mt-4"
						/>
					</div>
					<DialogFooter>
						<Button onClick={() => setOpenDialog(false)}>Cancel</Button>
						<Button onClick={handleConfirm}>Confirm</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	)
}
