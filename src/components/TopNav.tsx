'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Moon, Sun, Menu, X } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TopNav() {
	const [user, setUser] = useState<any>(null)
	const [theme, setTheme] = useState<'light' | 'dark'>('light')
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
		setMobileMenuOpen(false)
	}

	const closeMobileMenu = () => {
		setMobileMenuOpen(false)
	}

	return (
		<nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
			<div className="container mx-auto px-3 sm:px-4">
				<div className="flex items-center justify-between h-14 sm:h-16">
					{/* Logo */}
					<Link 
						href="/" 
						className="text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors"
						onClick={closeMobileMenu}
					>
						📚 ReadRepo
					</Link>
					
					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-2">
						{/* Theme Toggle */}
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							className="rounded-full w-8 h-8 hover:bg-accent/80 transition-all duration-200"
						>
							{theme === 'light' ? (
								<Moon className="h-4 w-4 transition-transform duration-200" />
							) : (
								<Sun className="h-4 w-4 transition-transform duration-200" />
							)}
						</Button>

						{user ? (
							<div className="flex items-center gap-2">
								<Link href="/books">
									<Button variant="ghost" size="sm" className="font-medium">
										My Books
									</Button>
								</Link>
								<Link href="/add">
									<Button variant="ghost" size="sm" className="font-medium">
										Add Books
									</Button>
								</Link>
								<Button 
									onClick={handleSignOut} 
									variant="outline"
									size="sm"
									className="font-medium"
								>
									Sign Out
								</Button>
							</div>
						) : (
							<Link href="/auth">
								<Button size="sm" className="font-medium">
									Sign In
								</Button>
							</Link>
						)}
					</div>

					{/* Mobile Navigation */}
					<div className="flex md:hidden items-center gap-2">
						{/* Theme Toggle for Mobile */}
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleTheme}
							className="rounded-full w-8 h-8 hover:bg-accent/80 transition-all duration-200"
						>
							{theme === 'light' ? (
								<Moon className="h-3 w-3" />
							) : (
								<Sun className="h-3 w-3" />
							)}
						</Button>

						{/* Mobile Menu */}
						<DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full w-8 h-8 hover:bg-accent/80"
								>
									{mobileMenuOpen ? (
										<X className="h-4 w-4" />
									) : (
										<Menu className="h-4 w-4" />
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56 mt-2">
								{user ? (
									<>
										<DropdownMenuItem asChild>
											<Link href="/books" onClick={closeMobileMenu} className="w-full cursor-pointer">
												My Books
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href="/add" onClick={closeMobileMenu} className="w-full cursor-pointer">
												Add Books
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
											Sign Out
										</DropdownMenuItem>
									</>
								) : (
									<DropdownMenuItem asChild>
										<Link href="/auth" onClick={closeMobileMenu} className="w-full cursor-pointer">
											Sign In
										</Link>
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</nav>
	)
}
