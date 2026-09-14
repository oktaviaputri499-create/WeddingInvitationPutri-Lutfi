'use client'

import { useState } from 'react'
import { addGuest, deleteGuest, resetRsvp } from '@/actions/admin'

export default function AdminClient({ initialGuests }: { initialGuests: any[] }) {
  const [newGuestName, setNewGuestName] = useState('')
  const [filter, setFilter] = useState('all') // all, attending, not_attending, pending
  const [search, setSearch] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGuestName.trim()) return
    await addGuest(newGuestName)
    setNewGuestName('')
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invitation/${token}`
    navigator.clipboard.writeText(url)
    alert('Link disalin: ' + url)
  }

  const downloadCSV = () => {
    const headers = ['Guest ID', 'Nama', 'Token', 'RSVP Status', 'Jumlah Kehadiran', 'URL']
    const rows = initialGuests.map(g => [
      g.id,
      g.name,
      g.token,
      g.rsvp?.status || 'pending',
      g.rsvp?.numberOfGuests || 0,
      `${window.location.origin}/invitation/${g.token}`
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "guests_export.csv")
    document.body.appendChild(link)
    link.click()
  }

  const filteredGuests = initialGuests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const status = g.rsvp?.status || 'pending'
    const matchesFilter = filter === 'all' || status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Daftar Tamu</h2>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="px-4 py-2 bg-stone-100 border border-stone-300 rounded hover:bg-stone-200 text-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200">
        <form onSubmit={handleAdd} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Nama Tamu Baru" 
            value={newGuestName} 
            onChange={e => setNewGuestName(e.target.value)}
            className="border p-2 rounded flex-1 md:w-64 text-sm focus:outline-none focus:border-stone-500"
          />
          <button type="submit" className="bg-dark-brown text-white px-4 py-2 rounded text-sm hover:bg-stone-700">Tambah</button>
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari nama..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded flex-1 text-sm focus:outline-none focus:border-stone-500"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-2 rounded text-sm bg-white">
            <option value="all">Semua Status</option>
            <option value="attending">Hadir</option>
            <option value="not_attending">Tidak Hadir</option>
            <option value="pending">Belum Konfirmasi</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-stone-100">
              <th className="p-3 border-b">Nama Tamu</th>
              <th className="p-3 border-b">Status RSVP</th>
              <th className="p-3 border-b">Jml Hadir</th>
              <th className="p-3 border-b">Token</th>
              <th className="p-3 border-b text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map(guest => (
              <tr key={guest.id} className="border-b hover:bg-stone-50">
                <td className="p-3 font-medium">{guest.name}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    guest.rsvp?.status === 'attending' ? 'bg-green-100 text-green-700' :
                    guest.rsvp?.status === 'not_attending' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {guest.rsvp?.status === 'attending' ? 'Hadir' :
                     guest.rsvp?.status === 'not_attending' ? 'Tidak Hadir' : 'Belum RSVP'}
                  </span>
                </td>
                <td className="p-3">{guest.rsvp?.numberOfGuests || '-'}</td>
                <td className="p-3 font-mono text-xs text-stone-500">{guest.token}</td>
                <td className="p-3 flex justify-end gap-2">
                  <button onClick={() => copyLink(guest.token)} className="text-blue-600 hover:underline text-xs">Copy Link</button>
                  <button onClick={() => resetRsvp(guest.id)} className="text-amber-600 hover:underline text-xs">Reset RSVP</button>
                  <button onClick={() => deleteGuest(guest.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                </td>
              </tr>
            ))}
            {filteredGuests.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-stone-500">Tidak ada tamu ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
