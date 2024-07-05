import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
		cell: (info) => (
			<div className="text-center">{info.getValue() as number}</div>
		),
	},
	{
		accessorKey: 'title',
		header: 'Title',
		cell: (info) => (
			<div className="font-medium">{info.getValue() as string}</div>
		),
	},
	{
		accessorKey: 'isbn',
		header: 'ISBN',
		cell: (info) => (
			<div className="text-center">{info.getValue() as string}</div>
		),
	},
	{
		accessorKey: 'author',
		header: 'Author',
		cell: (info) => <div>{info.getValue() as string}</div>,
	},
	{
		accessorKey: 'published_date',
		header: 'Published Date',
		cell: ({ getValue }) => {
			const dateStr = getValue() as string
			const date = new Date(dateStr)
			const formatted = date.toISOString().split('T')[0] // Formats date as "YYYY-MM-DD"
			return <div className="text-center">{formatted}</div>
		},
	},
	{
		accessorKey: 'purchased_date',
		header: 'Purchased Date',
		cell: ({ getValue }) => {
			const dateStr = getValue() as string | undefined
			const formatted = dateStr
				? new Date(dateStr).toISOString().split('T')[0]
				: 'N/A' // Formats date as "YYYY-MM-DD"
			return <div className="text-center">{formatted}</div>
		},
	},
	{
		accessorKey: 'purchase_location',
		header: 'Purchase Location',
		cell: (info) => <div>{(info.getValue() as string) || 'Unspecified'}</div>,
	},
	{
		accessorKey: 'read',
		header: 'Read',
		cell: (info) => (
			<div className="text-center">
				{(info.getValue() as boolean) ? (
					<span className="text-green-500">Yes</span>
				) : (
					<span className="text-red-500">No</span>
				)}
			</div>
		),
	},
	{
		accessorKey: 'reader',
		header: 'Reader',
		cell: (info) => <div>{(info.getValue() as string) || 'Unknown'}</div>,
	},
	{
		accessorKey: 'location',
		header: 'Location',
		cell: (info) => <div>{(info.getValue() as string) || 'Unspecified'}</div>,
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const book = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(book.isbn)}>
							Copy ISBN
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Edit book</DropdownMenuItem>
						<DropdownMenuItem>Delete book</DropdownMenuItem>
						<DropdownMenuItem>View on google books</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
