'use client'
import Image from 'next/image'
import { LoginForm } from '@/components/ui/LoginForm'

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<Image
				className="pb-8"
				src="/heroImage.png"
				alt="logo"
				width={500}
				height={500}
			/>
			<LoginForm />
		</main>
	)
}
