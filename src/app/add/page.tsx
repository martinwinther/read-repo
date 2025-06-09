'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchBooks, Book as GoogleBook } from '@/lib/utils'
import { BookSearchSkeleton, InlineLoader, LoadingSpinner } from '@/components/ui/loading-states'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, BookOpen, AlertCircle } from 'lucide-react'
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
	const [isSearching, setIsSearching] = useState<boolean>(false)
	const [searchError, setSearchError] = useState<string | null>(null)
	const [hasSearched, setHasSearched] = useState<boolean>(false)
	const { user, isLoading } = useAuth()
	const router = useRouter()

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleSearch = async () => {
		if (!query.trim()) {
			toast.error('Please enter a search term')
			return
		}

		try {
			setIsSearching(true)
			setSearchError(null)
			setHasSearched(true)
			const result = await fetchBooks(query)
			setBooks(result)
			
			if (result.length === 0) {
				toast.info('No books found. Try a different search term.')
			}
		} catch (error) {
			console.error('Search error:', error)
			setSearchError('Failed to search for books. Please try again.')
			toast.error('Failed to search for books')
		} finally {
			setIsSearching(false)
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
		if (!selectedBook) return
		
		const finalLocation = newLocation.trim() || selectedLocation
		if (!finalLocation) {
			toast.error('Please select or enter a location')
			return
		}

		try {
			setIsSubmitting(true)
			
			const bookData = {
				title: selectedBook.volumeInfo.title,
				author: selectedBook.volumeInfo.authors?.[0] || '',
				isbn: selectedBook.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
				published_date: formatPublishedDate(selectedBook.volumeInfo.publishedDate),
				location: finalLocation,
				read: false,
			}

			await addBook(bookData)
			
			toast.success(`"${selectedBook.volumeInfo.title}" added successfully!`)
			
			if (newLocation.trim() && !locations.includes(newLocation.trim())) {
				setLocations([...locations, newLocation.trim()])
			}
			
			setOpenDialog(false)
			setSelectedBook(null)
			setNewLocation('')
			setSelectedLocation('')
			
			// Redirect to books page
			router.push('/books')
		} catch (error) {
			console.error('Error adding book:', error)
			toast.error('Failed to add book. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	function formatPublishedDate(dateString?: string): string | undefined {
		if (!dateString) return undefined;
		
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
		
		// Return undefined for invalid formats
		return undefined;
	}

	if (isLoading) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center p-6">
				<LoadingSpinner className="py-12" />
			</main>
		)
	}

	// Helper function to get book cover image URL safely
	const getBookCoverUrl = (book: GoogleBook) => {
		return book.volumeInfo.imageLinks?.smallThumbnail || '/placeholder.png'
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
			<div className="w-full max-w-4xl">
				<Toaster position="bottom-right" />
				<Image
					className="py-8 mx-auto"
					src="/heroImage.png"
					alt="logo"
					width={400}
					height={400}
				/>
				
				<div className="space-y-4 mb-8">
					<div className="flex gap-3">
						<Input
							type="text"
							placeholder="Search for books by title, author, or ISBN..."
							value={query}
							onChange={handleInputChange}
							onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
							className="flex-1"
						/>
						<Button 
							onClick={handleSearch} 
							disabled={isSearching || !query.trim()}
							className="px-6"
						>
							{isSearching ? <InlineLoader size="sm" /> : 'Search'}
						</Button>
					</div>
				</div>

				<div className="mt-8">
					{isSearching ? (
						<BookSearchSkeleton />
					) : searchError ? (
						<EmptyState
							icon={AlertCircle}
							title="Search failed"
							description={searchError}
							action={{
								label: "Try again",
								onClick: handleSearch
							}}
						/>
					) : hasSearched && books.length === 0 ? (
						<EmptyState
							icon={Search}
							title="No books found"
							description={`No books found for "${query}". Try searching with different keywords, author names, or ISBN.`}
						/>
					) : hasSearched && books.length > 0 ? (
						<div className="grid gap-4">
							{books.map((book) => (
								<div key={book.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
									<Image
										src={getBookCoverUrl(book)}
										alt={book.volumeInfo.title}
										width={60}
										height={90}
										className="rounded-lg shadow-sm"
									/>
									<div className="flex-1 min-w-0">
										<h3 
											className="text-lg font-semibold cursor-pointer hover:text-primary hover:underline leading-tight mb-2"
											onClick={() => handleBookTitleClick(book)}
										>
											{book.volumeInfo.title}
										</h3>
										<div className="space-y-1 text-sm text-muted-foreground">
											<p>
												{book.volumeInfo.authors?.join(', ') || 'Unknown author'}
											</p>
											<p>
												{book.volumeInfo.publishedDate || 'Publication date unknown'}
											</p>
											{book.volumeInfo.publisher && (
												<p>{book.volumeInfo.publisher}</p>
											)}
										</div>
										<Button
											className="mt-3"
											size="sm"
											onClick={() => handleAddClick(book)}>
											Add to Collection
										</Button>
									</div>
								</div>
							))}
						</div>
					) : !hasSearched ? (
						<EmptyState
							icon={BookOpen}
							title="Search for books"
							description="Enter a book title, author name, or ISBN to find books and add them to your collection."
						/>
					) : null}
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
						<div className="mt-4 p-4 bg-muted/30 rounded-lg">
							<h3 className="text-lg font-semibold">
								{selectedBook.volumeInfo.title}
							</h3>
							<p className="text-muted-foreground">
								{selectedBook.volumeInfo.authors?.join(', ') || 'Unknown author'}
							</p>
							<p className="text-sm text-muted-foreground">
								{selectedBook.volumeInfo.publishedDate || 'Publication date unknown'}
							</p>
						</div>
					)}
					<div className="space-y-4">
						<Select onValueChange={setSelectedLocation} value={selectedLocation}>
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
							placeholder="Or add a new location"
							value={newLocation}
							onChange={(e) => setNewLocation(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button onClick={handleConfirm} disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<InlineLoader size="sm" />
									<span className="ml-2">Adding...</span>
								</>
							) : (
								'Add Book'
							)}
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
