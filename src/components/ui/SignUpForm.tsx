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

interface SignUpFormProps {
	onViewChange: (view: 'sign-in' | 'sign-up' | 'reset-password') => void;
}

export function SignUpForm({ onViewChange }: SignUpFormProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const router = useRouter()
	const supabase = createClientComponentClient()

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setMessage(null)

		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			})

			if (error) {
				throw error
			}

			// If auto-confirmed (no email verification required)
			if (data?.session) {
				router.push('/books')
				router.refresh()
			} else {
				setMessage('Check your email for the confirmation link!')
			}
		} catch (error: any) {
			setError(error.message || 'An error occurred during sign up')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Create Account</CardTitle>
				<CardDescription>
					Enter your email to create a new account.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSignUp}>
				<CardContent className="grid gap-4">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}
					{message && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
							{message}
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
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Button className="w-full" type="submit" disabled={loading}>
						{loading ? 'Creating account...' : 'Sign up'}
					</Button>
					<Button 
						variant="ghost" 
						className="w-full" 
						type="button"
						onClick={() => onViewChange('sign-in')}
					>
						Already have an account? Sign in
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
} 