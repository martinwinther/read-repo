import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'

import { cn } from '@/lib/utils'
import TopNav from '@/components/TopNav'

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})

export const metadata: Metadata = {
	title: 'Read Repo',
	description: 'Organize your library',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={cn(
					'min-h-screen bg-background font-sans antialiased',
					fontSans.variable
				)}>
				<TopNav />
				{children}
			</body>
		</html>
	)
}
