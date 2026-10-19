import CheckinScanner from './CheckinScanner'

export const dynamic = 'force-dynamic'

export default function CheckinPage({
  searchParams,
}: {
  searchParams: { secret?: string }
}) {
  const secret = searchParams.secret
  const backHref = secret
    ? `/admin?secret=${encodeURIComponent(secret)}`
    : '/admin'

  return (
    <div className="min-h-screen bg-stone-100 p-8 text-stone-800">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Scan Check-in</h1>
          <a
            href={backHref}
            className="px-4 py-2 border border-dark-brown text-dark-brown text-sm rounded-md hover:bg-dark-brown hover:text-white transition"
          >
            Kembali
          </a>
        </div>

        <CheckinScanner secret={secret || ''} />
      </div>
    </div>
  )
}