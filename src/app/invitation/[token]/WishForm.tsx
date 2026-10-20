'use client'

import { useState } from 'react'
import { submitWish } from '@/actions/guest'

const GOLD = '#d4b26e'
const IVORY = '#f3ece0'
const MUTED = '#cdbfa8'

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
    <form onSubmit={handleSubmit} className="font-lux text-left">
      <div className="mb-4">
        <label className="block text-base font-semibold mb-2" style={{ color: IVORY }}>
          Nama
        </label>
        <input
          type="text"
          value={guestName}
          disabled
          className="w-full p-2.5 rounded-md text-base cursor-not-allowed"
          style={{
            backgroundColor: 'rgba(12,10,8,0.55)',
            border: '1px solid rgba(212,178,110,0.3)',
            color: MUTED,
            WebkitTextFillColor: MUTED,
            opacity: 1,
          }}
        />
        <p className="text-sm italic mt-1" style={{ color: MUTED }}>
          *Nama tidak dapat diubah
        </p>
      </div>

      <div className="mb-5">
        <label className="block text-base font-semibold mb-2" style={{ color: IVORY }}>
          Ucapan / Doa
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Tuliskan doa dan harapan..."
          className="w-full p-2.5 rounded-md text-base focus:outline-none placeholder:text-[#cdbfa8]/60"
          style={{
            backgroundColor: 'rgba(12,10,8,0.55)',
            border: '1px solid rgba(212,178,110,0.45)',
            color: IVORY,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(212,178,110,0.45)')}
        ></textarea>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full py-3 rounded-md font-semibold transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: GOLD, color: '#1b1510' }}
      >
        {loading ? 'Mengirim...' : 'Kirim Ucapan'}
      </button>
    </form>
  )
}