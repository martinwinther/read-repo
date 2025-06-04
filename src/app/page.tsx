'use client'

import { LoginForm } from '@/components/ui/LoginForm'
import { SignUpForm } from '@/components/ui/SignUpForm'
import { ResetPasswordForm } from '@/components/ui/ResetPasswordForm'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

export default function HomePage() {
	const [view, setView] = useState<'sign-in' | 'sign-up' | 'reset-password'>('sign-in')
	const router = useRouter()
	const supabase = createClientComponentClient()
	
	useEffect(() => {
		const checkUser = async () => {
			const { data: { session } } = await supabase.auth.getSession()
			if (session) {
				router.push('/books')
			}
		}
		checkUser()
	}, [router, supabase])
	
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh]">
			<div className="w-full max-w-sm space-y-6">
				<div className="flex justify-center items-center space-x-4">
					<Button 
						variant={view === 'sign-in' ? 'secondary' : 'ghost'}
						onClick={() => setView('sign-in')}
						className="w-24"
					>
						Sign In
					</Button>
					<Button 
						variant={view === 'sign-up' ? 'secondary' : 'ghost'}
						onClick={() => setView('sign-up')}
						className="w-24"
					>
						Sign Up
					</Button>
				</div>
				
				{view === 'sign-in' && <LoginForm onViewChange={setView} />}
				{view === 'sign-up' && <SignUpForm onViewChange={setView} />}
				{view === 'reset-password' && <ResetPasswordForm onViewChange={setView} />}
			</div>
		</div>
	)
}
