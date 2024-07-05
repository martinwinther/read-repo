import { ColumnDef } from '@tanstack/react-table'
import React from 'react'

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
]
