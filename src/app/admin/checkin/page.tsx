import { prisma } from '@/lib/prisma'
import { addGuest, deleteGuest, resetRsvp } from '@/actions/admin'
import AdminClient from './AdminClient'

export const dynamic = "force-dynamic"

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { secret?: string }
}) {
  const secret = searchParams.secret
  const settingsHref = secret
    ? `/admin/settings?secret=${encodeURIComponent(secret)}`
    : '/admin/settings'
  const checkinHref = secret
    ? `/admin/checkin?secret=${encodeURIComponent(secret)}`
    : '/admin/checkin'

  const guests = await prisma.guest.findMany({
    include: { rsvp: true },
    orderBy: { createdAt: 'desc' }
  })

  const totalGuests = guests.length
  const attending = guests.filter(g => g.rsvp?.status === 'attending').length
  const notAttending = guests.filter(g => g.rsvp?.status === 'not_attending').length
  const pending = guests.filter(g => g.rsvp?.status === 'pending' || !g.rsvp).length
  const checkedIn = guests.filter(g => g.checkedInAt).length

  const expectedAttendance = guests
    .filter(g => g.rsvp?.status === 'attending')
    .reduce((sum, g) => sum + (g.rsvp?.numberOfGuests || 0), 0)

  return (
    <div className="min-h-screen bg-stone-100 p-8 text-stone-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <a
              href={checkinHref}
              className="px-4 py-2 border border-dark-brown text-dark-brown text-sm rounded-md hover:bg-dark-brown hover:text-white transition"
            >
              Scan Check-in
            </a>
            <a
              href={settingsHref}
              className="px-4 py-2 bg-dark-brown text-white text-sm rounded-md hover:bg-gold transition"
            >
              Pengaturan Undangan
            </a>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500">Total Tamu (Undangan)</p>
            <p className="text-3xl font-bold">{totalGuests}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500">Akan Hadir</p>
            <p className="text-3xl font-bold text-green-600">{attending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500">Tidak Hadir</p>
            <p className="text-3xl font-bold text-red-600">{notAttending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500">Belum Konfirmasi</p>
            <p className="text-3xl font-bold text-amber-600">{pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500">Sudah Check-in</p>
            <p className="text-3xl font-bold text-blue-600">{checkedIn}</p>
          </div>
          <div className="bg-dark-brown p-6 rounded-lg shadow-sm text-white">
            <p className="text-sm text-stone-300">Total Kehadiran (Orang)</p>
            <p className="text-3xl font-bold">{expectedAttendance}</p>
          </div>
        </div>

        {/* Guest Management */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <AdminClient initialGuests={guests} />
        </div>
      </div>
    </div>
  )
}