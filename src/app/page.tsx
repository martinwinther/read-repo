import Image from 'next/image'
import { Input } from '@/components/ui/input'

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div>
				<Image
					className="py-8"
					src="/heroImage.png"
					alt="logo"
					width={500}
					height={500}
				/>
				<Input type="text" placeholder="Add a book" />
			</div>
		</main>
	)
}
