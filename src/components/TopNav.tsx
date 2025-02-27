'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { useAuth } from '@/context/AuthContext'

export default function TopNav() {
	const { user, signOut } = useAuth()

	return (
		<nav className="bg-gray-800 p-4 w-full flex justify-between items-center">
			<Link href="/">
				<div className="text-white text-xl">ReadRepo</div>
			</Link>

			<div className="flex space-x-4">
				{user ? (
					<>
						<Link href="/add">
							<Button variant={'outline'}>Add Book</Button>
						</Link>
						<Link href="/books">
							<Button variant={'outline'}>View Books</Button>
						</Link>
						<Button variant={'outline'} onClick={() => signOut()}>
							Sign Out
						</Button>
						<span className="text-white flex items-center ml-2">
							{user.email}
						</span>
					</>
				) : (
					<Link href="/login">
						<Button variant={'outline'}>Login</Button>
					</Link>
				)}
			</div>
		</nav>
	)
}
