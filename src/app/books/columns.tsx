'use client'

import { ColumnDef } from '@tanstack/react-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
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

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'title',
		header: 'Title',
	},
	{
		accessorKey: 'isbn',
		header: 'ISBN',
	},
	{
		accessorKey: 'author',
		header: 'Author',
	},
	{
		accessorKey: 'published_date',
		header: 'Published Date',
	},
	{
		accessorKey: 'purchased_date',
		header: 'Purchased Date',
	},
	{
		accessorKey: 'purchase_location',
		header: 'Purchase Location',
	},
	{
		accessorKey: 'read',
		header: 'Read',
		cell: (info) => (info.getValue() ? 'Yes' : 'No'),
	},
	{
		accessorKey: 'reader',
		header: 'Reader',
	},
	{
		accessorKey: 'location',
		header: 'Location',
	},
]
