'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
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

function ResetPasswordForm() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const router = useRouter()
	const searchParams = useSearchParams()
	const supabase = createClientComponentClient()

	useEffect(() => {
		const handleReset = async () => {
			const token = searchParams.get('token')
			const type = searchParams.get('type')

			if (type === 'recovery' && token) {
				try {
					// We don't need to verify the token here as Supabase will handle it
					// when we update the password. The token is already validated by the
					// middleware when the user accesses this page.
					const { data: { session } } = await supabase.auth.getSession()
					if (!session) {
						setError('Invalid or expired reset link. Please request a new password reset.')
					}
				} catch (error: any) {
					setError('Invalid or expired reset link. Please request a new password reset.')
				}
			} else {
				setError('Invalid reset link. Please request a new password reset.')
			}
		}

		handleReset()
	}, [searchParams, supabase])

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setMessage(null)

		if (password !== confirmPassword) {
			setError('Passwords do not match')
			setLoading(false)
			return
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: password
			})

			if (error) {
				throw error
			}

			setMessage('Password updated successfully! Redirecting to login...')
			setTimeout(() => {
				router.push('/')
			}, 2000)
		} catch (error: any) {
			setError(error.message || 'An error occurred while updating your password')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Reset Password</CardTitle>
				<CardDescription>
					Enter your new password below.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleResetPassword}>
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
						<Label htmlFor="password">New Password</Label>
						<Input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button className="w-full" type="submit" disabled={loading}>
						{loading ? 'Updating...' : 'Update Password'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}

export default function ResetPasswordPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh]">
			<Suspense fallback={
				<Card className="w-full max-w-sm">
					<CardContent className="py-8 text-center">
						Loading...
					</CardContent>
				</Card>
			}>
				<ResetPasswordForm />
			</Suspense>
		</div>
	)
} 