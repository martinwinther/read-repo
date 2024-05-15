import Image from 'next/image'
import { Input } from '@/components/ui/input'

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div>
				<Input type="text" placeholder="Add a book" />
			</div>
		</main>
	)
}
