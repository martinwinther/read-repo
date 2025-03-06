'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchBooks, Book as GoogleBook } from '@/lib/utils'
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
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { addBook } from '@/lib/booksService'
import { BookDetailsDialog } from './BookDetailsDialog'

interface BookWithLocation extends GoogleBook {
	location: string
}

// Helper to get the best ISBN from industry identifiers
function getPreferredISBN(identifiers?: Array<{type: string, identifier: string}>): string {
	if (!identifiers || identifiers.length === 0) return '';
	
	// Try to find ISBN-13 first
	const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
	if (isbn13) return isbn13.identifier;
	
	// Fall back to ISBN-10
	const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
	if (isbn10) return isbn10.identifier;
	
	// Last resort, use the first identifier
	return identifiers[0].identifier;
}

export default function AddBook() {
	const [query, setQuery] = useState<string>('')
	const [books, setBooks] = useState<GoogleBook[]>([])
	const [openDialog, setOpenDialog] = useState<boolean>(false)
	const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null)
	const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false)
	const [detailsBook, setDetailsBook] = useState<GoogleBook | null>(null)
	const [locations, setLocations] = useState<string[]>([
		'Living Room',
		'Bedroom',
		'Office',
	])
	const [newLocation, setNewLocation] = useState<string>('')
	const [selectedLocation, setSelectedLocation] = useState<string>('')
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const { user, isLoading } = useAuth()
	const router = useRouter()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleSearch = async () => {
		if (query.trim()) {
			const result = await fetchBooks(query)
			setBooks(result)
		}
	}

	const handleAddClick = (book: GoogleBook) => {
		setSelectedBook(book)
		setOpenDialog(true)
	}

	const handleBookTitleClick = (book: GoogleBook) => {
		setDetailsBook(book)
		setOpenDetailsDialog(true)
	}

	const handleConfirm = async () => {
		const location = newLocation || selectedLocation
		if (location && selectedBook) {
			setIsSubmitting(true)
			
			try {
				// Format Google Book to match our database schema
				const bookToAdd = {
					title: selectedBook.volumeInfo.title,
					author: selectedBook.volumeInfo.authors?.join(', ') || '',
					published_date: formatPublishedDate(selectedBook.volumeInfo.publishedDate),
					read: false,
					location: location,
					// Add ISBN if available - prefer ISBN-13 over ISBN-10
					isbn: getPreferredISBN(selectedBook.volumeInfo.industryIdentifiers),
				}
				
				// Call the server action instead of client-side function
				const result = await addBook({
					...bookToAdd,
					published_date: bookToAdd.published_date || undefined
				});
				
				// Add new location to our list if it's new
				if (newLocation && !locations.includes(newLocation)) {
					setLocations([...locations, newLocation])
				}
				
				toast.success(`Book added to ${location}`)
				
				// Close dialog and reset
				setOpenDialog(false)
				setSelectedBook(null)
				setNewLocation('')
				setSelectedLocation('')
				
				// Note: The router.push is handled by the server action now
				
			} catch (error) {
				console.error('Error adding book:', error)
				toast.error('Failed to add book to your collection')
			} finally {
				setIsSubmitting(false)
			}
		} else {
			toast.error('Please select or add a location')
		}
	}

	function formatPublishedDate(dateString?: string): string | null {
		if (!dateString) return null;
		
		// Check if it's just a year
		if (/^\d{4}$/.test(dateString)) {
			return `${dateString}-01-01`; // Convert year to YYYY-01-01
		}
		
		// Check if it's a year and month (YYYY-MM)
		if (/^\d{4}-\d{2}$/.test(dateString)) {
			return `${dateString}-01`; // Add day
		}
		
		// Return as-is if it's already in YYYY-MM-DD format
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
			return dateString;
		}
		
		// Return null for invalid formats
		return null;
	}

	if (isLoading) {
		return <div>Loading...</div>
	}

	// Helper function to get book cover image URL safely
	const getBookCoverUrl = (book: GoogleBook) => {
		return book.volumeInfo.imageLinks?.smallThumbnail || '/placeholder.png'
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div>
				<Toaster position="bottom-right" />
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

				<div className="mt-4">
					{books.length > 0 ? (
						<ul>
							{books.map((book) => (
								<li key={book.id} className="mb-4 flex items-start space-x-4">
									<Image
										src={getBookCoverUrl(book)}
										alt={book.volumeInfo.title}
										width={60}
										height={90}
										className="rounded-lg"
									/>
									<div className="flex-1">
										<h3 
											className="text-xl font-bold cursor-pointer hover:text-blue-600 hover:underline"
											onClick={() => handleBookTitleClick(book)}
										>
											{book.volumeInfo.title}
										</h3>
										<div className="flex flex-col">
											<p className="text-gray-700">
												{book.volumeInfo.authors?.join(', ')}
											</p>
											<p className="text-gray-500">
												{book.volumeInfo.publishedDate}
											</p>
										</div>
										<Button
											className="mt-4"
											onClick={() => handleAddClick(book)}>
											Add
										</Button>
									</div>
								</li>
							))}
						</ul>
					) : (
						''
					)}
				</div>
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
						<Button onClick={handleConfirm} disabled={isSubmitting}>
							{isSubmitting ? 'Adding...' : 'Confirm'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			
			{/* Book Details Dialog */}
			<BookDetailsDialog
				book={detailsBook}
				open={openDetailsDialog}
				onOpenChange={setOpenDetailsDialog}
				onAddClick={handleAddClick}
			/>
		</main>
	)
}
