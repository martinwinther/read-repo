'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
	onViewChange: (view: 'sign-in' | 'sign-up' | 'reset-password') => void;
}

export function LoginForm({ onViewChange }: LoginFormProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const supabase = createClientComponentClient()

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) {
				throw error
			}

			router.push('/books')
			router.refresh()
		} catch (error: any) {
			setError(error.message || 'An error occurred during sign in')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>
					Enter your email below to login to your account.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSignIn}>
				<CardContent className="grid gap-4">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input 
							id="email" 
							type="email" 
							placeholder="m@example.com" 
							required 
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input 
							id="password" 
							type="password" 
							required 
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div className="text-right">
						<button
							type="button"
							onClick={() => onViewChange('reset-password')}
							className="text-sm text-muted-foreground hover:text-primary"
						>
							Forgot your password?
						</button>
					</div>
				</CardContent>
				<CardFooter>
					<Button className="w-full" type="submit" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign in'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}
