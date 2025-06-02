'use client'

import { useState } from 'react'
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

interface ResetPasswordFormProps {
	onViewChange: (view: 'sign-in' | 'sign-up' | 'reset-password') => void;
}

export function ResetPasswordForm({ onViewChange }: ResetPasswordFormProps) {
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [loading, setLoading] = useState(false)
	const supabase = createClientComponentClient()

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setSuccess(false)

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			})

			if (error) {
				throw error
			}

			setSuccess(true)
		} catch (error: any) {
			setError(error.message || 'An error occurred while sending the reset email')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Reset Password</CardTitle>
				<CardDescription>
					Enter your email address and we'll send you a link to reset your password.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleResetPassword}>
				<CardContent className="grid gap-4">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}
					{success && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
							Check your email for a password reset link.
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
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Button className="w-full" type="submit" disabled={loading}>
						{loading ? 'Sending...' : 'Send Reset Link'}
					</Button>
					<Button 
						variant="ghost" 
						className="w-full" 
						type="button"
						onClick={() => onViewChange('sign-in')}
					>
						Back to Sign In
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
} 