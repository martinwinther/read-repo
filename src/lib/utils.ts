// functions

//shadcn/ui
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import 'dotenv/config'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Formats an ISBN to a standardized hyphenated format and removes any non-ISBN prefixes
 * 
 * For ISBN-13 (978 or 979 prefix):
 * Format: XXX-X-XX-XXXXXX-X (prefix-group-publisher-title-check)
 * 
 * For ISBN-10:
 * Format: X-XX-XXXXXX-X (group-publisher-title-check)
 * 
 * This function will extract any ISBN-like sequence and discard any other text
 */
export function formatIsbn(isbn: string | undefined): string | undefined {
	if (!isbn) return undefined;
	
	// First, try to extract a valid ISBN sequence (10-13 digits)
	// This will handle cases like "HARVARD:9780470549421" by extracting just "9780470549421"
	const matches = isbn.match(/(\d{10,13})/);
	if (matches && matches[1]) {
		const potentialIsbn = matches[1];
		return formatIsbnDigits(potentialIsbn);
	}
	
	// If we can't find a sequence of 10-13 digits, try to clean the existing string
	// This handles cases where the ISBN might be formatted already with hyphens
	return formatIsbnDigits(isbn);
}

/**
 * Helper function that formats a clean numeric ISBN string
 */
function formatIsbnDigits(isbn: string): string {
	// Remove all non-alphanumeric characters
	const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
	
	// Check if it's a valid ISBN format
	if (!(/^(978|979|97[8-9])?[0-9]{9}[0-9X]$/i.test(cleanIsbn))) {
		return isbn; // Return original if it's not a standard ISBN format
	}
	
	// Format ISBN-13
	if (cleanIsbn.length === 13) {
		// Basic ISBN-13 hyphenation (prefix-group-publisher-title-check)
		const prefix = cleanIsbn.substring(0, 3);
		const group = cleanIsbn.substring(3, 4);
		const publisher = cleanIsbn.substring(4, 6);
		const title = cleanIsbn.substring(6, 12);
		const check = cleanIsbn.substring(12, 13);
		
		return `${prefix}-${group}-${publisher}-${title}-${check}`;
	}
	
	// Format ISBN-10
	if (cleanIsbn.length === 10) {
		// Basic ISBN-10 hyphenation (group-publisher-title-check)
		const group = cleanIsbn.substring(0, 1);
		const publisher = cleanIsbn.substring(1, 3);
		const title = cleanIsbn.substring(3, 9);
		const check = cleanIsbn.substring(9, 10);
		
		return `${group}-${publisher}-${title}-${check}`;
	}
	
	// Return the original if it doesn't fit standard length
	return isbn;
}

// src/lib/utils.ts
export interface Book {
	id: string
	volumeInfo: {
		imageLinks?: {
			smallThumbnail?: string
			thumbnail?: string
			small?: string
			medium?: string
			large?: string
			extraLarge?: string
		}
		title: string
		subtitle?: string
		authors?: string[]
		publishedDate?: string
		publisher?: string
		description?: string
		pageCount?: number
		categories?: string[]
		language?: string
		industryIdentifiers?: Array<{
			type: string
			identifier: string
		}>
	}
}

export async function fetchBooks(query: string): Promise<Book[]> {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
	
	// First attempt: search with more precise query parameters
	// Using intitle: to search by title specifically
	// We'll try to get results in English first, but won't strictly limit to English
	const titleQuery = encodeURIComponent(`intitle:"${query}"`);
	
	const res = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=${titleQuery}&langRestrict=en&orderBy=relevance&maxResults=20&key=${apiKey}`
	)
	
	let data = await res.json()
	
	// If we got no or few results, try a more general search
	if (!data.items || data.items.length < 5) {
		console.log("Initial search returned few results, trying general search");
		
		// Regular search without strict title restriction
		const generalQuery = encodeURIComponent(query);
		const fallbackRes = await fetch(
			`https://www.googleapis.com/books/v1/volumes?q=${generalQuery}&orderBy=relevance&maxResults=40&key=${apiKey}`
		)
		data = await fallbackRes.json()
	}
	
	console.log(data)
	return data.items || []
}

function ActionsCellWrapper({ book }: { book: Book }) {
	// Now the hook is used inside a proper React component
	const refreshBooks = React.useContext(BooksRefreshContext);
	return <ActionsCell book={book} refreshBooks={refreshBooks} />;
}
