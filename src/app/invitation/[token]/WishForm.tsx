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
    <form onSubmit={handleSubmit} className="text-left">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-dark-brown">Nama</label>
        <input type="text" value={guestName} disabled className="w-full p-2 border border-stone-300 rounded-md bg-white/70 text-stone-500 cursor-not-allowed" />
        <p className="text-xs text-stone-500 mt-1">*Nama tidak dapat diubah</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-dark-brown">Ucapan / Doa</label>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Tuliskan doa dan harapan..." className="w-full p-2 border border-stone-300 rounded-md bg-white/70 focus:outline-none focus:border-gold"></textarea>
      </div>
      <button disabled={loading} type="submit" className="w-full bg-gold text-white py-2 rounded-md hover:bg-dark-brown transition disabled:opacity-50">
        {loading ? 'Mengirim...' : 'Kirim Ucapan'}
      </button>
    </form>
  )
}