'use client'

import Link from 'next/link'
import { Button } from './ui/button'

export default function TopNav() {
	return (
		<nav className="bg-gray-800 p-4 w-full flex justify-between items-center">
			<Link href="/">
				<div className="text-white text-xl">ReadRepo</div>
			</Link>

			<div className="flex space-x-4">
				<Link href="/add">
					<Button variant={'outline'}>Add Book</Button>
				</Link>
				<Link href="/books">
					<Button variant={'outline'}>View Books</Button>
				</Link>
			</div>
		</nav>
	)
}
