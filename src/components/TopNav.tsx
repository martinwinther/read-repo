'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function TopNav() {
	const [user, setUser] = useState<any>(null)
	const [theme, setTheme] = useState<'light' | 'dark'>('light')
	const router = useRouter()
	const supabase = createClientComponentClient()

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
		}
		getUser()

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user ?? null)
		})

		// Check for saved theme preference or default to 'light'
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
		
		setTheme(initialTheme)
		document.documentElement.classList.toggle('dark', initialTheme === 'dark')

		return () => subscription.unsubscribe()
	}, [supabase])

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)
		localStorage.setItem('theme', newTheme)
		document.documentElement.classList.toggle('dark', newTheme === 'dark')
	}

	const handleSignOut = async () => {
		await supabase.auth.signOut()
		router.push('/')
	}

	return (
		<nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center justify-between">
					<Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
						📚 ReadRepo
					</Link>
					
					<div className="flex items-center gap-3">
						{/* Theme Toggle */}
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							className="rounded-full w-9 h-9 hover:bg-accent/80 transition-all duration-200"
						>
							{theme === 'light' ? (
								<Moon className="h-4 w-4 transition-transform duration-200" />
							) : (
								<Sun className="h-4 w-4 transition-transform duration-200" />
							)}
						</Button>

						{user ? (
							<div className="flex items-center gap-3">
								<Link href="/books">
									<Button variant="ghost" className="font-medium">
										My Books
									</Button>
								</Link>
								<Link href="/add">
									<Button variant="ghost" className="font-medium">
										Add Books
									</Button>
								</Link>
								<Button 
									onClick={handleSignOut} 
									variant="outline"
									className="font-medium"
								>
									Sign Out
								</Button>
							</div>
						) : (
							<Link href="/auth">
								<Button className="font-medium">
									Sign In
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	)
}
