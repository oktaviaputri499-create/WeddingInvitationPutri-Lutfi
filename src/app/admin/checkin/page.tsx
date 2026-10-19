import CheckinScanner from './CheckinScanner'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: { secret?: string }
}) {
  const secret = searchParams.secret
  const backHref = secret
    ? `/admin?secret=${encodeURIComponent(secret)}`
    : '/admin'

  const checkedInGuests = await prisma.guest.findMany({
    where: { checkedInAt: { not: null } },
    include: { rsvp: true },
    orderBy: { checkedInAt: 'desc' },
  })

  const totalGuests = checkedInGuests.length
  const totalPax = checkedInGuests.reduce(
    (sum, g) => sum + (g.rsvp?.numberOfGuests || 1),
    0
  )

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

        {/* Checked-in list */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Sudah Check-in</h2>
            <p className="text-sm text-stone-600">
              {totalGuests} tamu · {totalPax} orang
            </p>
          </div>

          {checkedInGuests.length === 0 ? (
            <p className="text-sm text-stone-500">Belum ada tamu yang check-in.</p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {checkedInGuests.map(g => (
                <li key={g.id} className="py-2 flex items-center gap-3 text-sm">
                  {g.checkInPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.checkInPhoto}
                      alt={g.name}
                      className="w-12 h-12 rounded-full object-cover border border-stone-300 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs shrink-0">
                      –
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-stone-500">
                      {g.rsvp?.numberOfGuests || 1} orang
                    </p>
                  </div>
                  <p className="text-xs text-stone-500">
                    {g.checkedInAt
                      ? new Date(g.checkedInAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Jakarta',
                        })
                      : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}