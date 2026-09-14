import { redirect } from 'next/navigation'

export default function Home({ searchParams }: { searchParams: { guest?: string } }) {
  if (searchParams.guest) {
    redirect(`/invitation/${searchParams.guest}`)
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div>
        <h1 className="text-3xl font-serif mb-4 text-gold">Welcome</h1>
        <p>Silakan gunakan link undangan yang telah diberikan kepada Anda.</p>
      </div>
    </div>
  )
}
