import { prisma } from '@/lib/prisma'
import { addGuest, deleteGuest, resetRsvp } from '@/actions/admin'
import AdminClient from './AdminClient'

export default async function AdminDashboard() {
  const guests = await prisma.guest.findMany({
    include: { rsvp: true },
    orderBy: { createdAt: 'desc' }
  })

  const totalGuests = guests.length
  const attending = guests.filter(g => g.rsvp?.status === 'attending').length
  const notAttending = guests.filter(g => g.rsvp?.status === 'not_attending').length
  const pending = guests.filter(g => g.rsvp?.status === 'pending' || !g.rsvp).length
  
  const expectedAttendance = guests
    .filter(g => g.rsvp?.status === 'attending')
    .reduce((sum, g) => sum + (g.rsvp?.numberOfGuests || 0), 0)

  return (
    <div className="min-h-screen bg-stone-100 p-8 text-stone-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
