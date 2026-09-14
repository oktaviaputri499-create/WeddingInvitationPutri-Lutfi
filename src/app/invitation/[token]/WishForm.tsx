'use client'

import { useState } from 'react'
import { submitWish } from '@/actions/guest'

export default function WishForm({ token, guestName }: { token: string, guestName: string }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      await submitWish(token, message)
      setMessage('')
    } catch (err) {
      alert("Gagal mengirim ucapan.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="text-left bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Nama</label>
        <input type="text" value={guestName} disabled className="w-full p-2 border border-stone-200 rounded-md bg-stone-100 text-stone-500 cursor-not-allowed" />
        <p className="text-xs text-stone-400 mt-1">*Nama tidak dapat diubah</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Ucapan / Doa</label>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Tuliskan doa dan harapan..." className="w-full p-2 border border-stone-300 rounded-md focus:outline-none focus:border-gold"></textarea>
      </div>
      <button disabled={loading} type="submit" className="w-full bg-gold text-white py-2 rounded-md hover:bg-dark-brown transition disabled:opacity-50">
        {loading ? 'Mengirim...' : 'Kirim Ucapan'}
      </button>
    </form>
  )
}
