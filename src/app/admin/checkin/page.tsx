import { prisma } from '@/lib/prisma'
import CheckinScanner from './CheckinScanner'

export const dynamic = 'force-dynamic'

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: { secret?: string }
}) {
  const secret = searchParams.secret ?? ''
  const dashboardHref = secret
    ? `/admin?secret=${encodeURIComponent(secret)}`
    : '/admin'

  const guests = await prisma.guest.findMany({
    include: { rsvp: true },
    orderBy: { createdAt: 'desc' },
  })

  const attendingGuests = guests.filter(g => g.rsvp?.status === 'attending')
  const checkedIn = guests
    .filter(g => g.checkedInAt)
    .sort(
      (a, b) =>
        new Date(b.checkedInAt as Date).getTime() -
        new Date(a.checkedInAt as Date).getTime()
    )

  const checkedInPeople = checkedIn.reduce(
    (sum, g) => sum + (g.rsvp?.numberOfGuests || 1),
    0
  )

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 text-stone-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Check-in Tamu</h1>
          <a
            href={dashboardHref}
            className="px-4 py-2 border border-dark-brown text-dark-brown text-sm rounded-md hover:bg-dark-brown hover:text-white transition"
          >
            Kembali ke Dashboard
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500">Sudah Check-in (Undangan)</p>
            <p className="text-3xl font-bold text-green-600">
              {checkedIn.length}
              <span className="text-base text-stone-400"> / {attendingGuests.length}</span>
            </p>
          </div>
          <div className="bg-dark-brown p-4 rounded-lg shadow-sm text-white">
            <p className="text-sm text-stone-300">Total Orang Hadir</p>
            <p className="text-3xl font-bold">{checkedInPeople}</p>
          </div>
        </div>

        <CheckinScanner secret={secret} />

        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 mt-6">
          <h2 className="font-bold mb-3">Daftar Tamu yang Sudah Check-in</h2>
          {checkedIn.length === 0 ? (
            <p className="text-sm text-stone-500">Belum ada tamu yang check-in.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-stone-500 border-b border-stone-200">
                  <th className="py-2">Nama</th>
                  <th className="py-2">Jml</th>
                  <th className="py-2 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {checkedIn.map(g => (
                  <tr key={g.token} className="border-b border-stone-100">
                    <td className="py-2 font-medium">{g.name}</td>
                    <td className="py-2">{g.rsvp?.numberOfGuests || 1}</td>
                    <td className="py-2 text-right text-stone-500">
                      {new Date(g.checkedInAt as Date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Jakarta',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}