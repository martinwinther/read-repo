// functions

//shadcn/ui
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import 'dotenv/config'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// src/lib/utils.ts
export interface Book {
	id: string
	volumeInfo: {
		title: string
		authors?: string[]
		publishedDate?: string
	}
}

export async function fetchBooks(query: string): Promise<Book[]> {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
	const res = await fetch(
		`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`
	)
	const data = await res.json()
	console.log(data)
	return data.items || []
}
