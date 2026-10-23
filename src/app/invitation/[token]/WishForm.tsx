'use client'

import { useState } from 'react'
import { submitWish } from '@/actions/guest'

const ACCENT = '#4a90d9'
const INK = '#23446b'
const MUTED = '#5f82a8'

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
        <label className="block text-base font-semibold mb-2" style={{ color: INK }}>
          Nama
        </label>
        <input
          type="text"
          value={guestName}
          disabled
          className="w-full p-2.5 rounded-md text-base cursor-not-allowed"
          style={{
            backgroundColor: 'rgba(226,240,253,0.8)',
            border: '1px solid rgba(74,144,217,0.35)',
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
        <label className="block text-base font-semibold mb-2" style={{ color: INK }}>
          Ucapan / Doa
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Tuliskan doa dan harapan..."
          className="w-full p-2.5 rounded-md text-base focus:outline-none placeholder:text-[#5f82a8]/60"
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(74,144,217,0.5)',
            color: INK,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(74,144,217,0.5)')}
        ></textarea>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full py-3 rounded-md font-semibold transition hover:opacity-90 disabled:opacity-50"
        style={{
          background: 'linear-gradient(180deg,#6fb1ec,#4a90d9)',
          color: '#ffffff',
          boxShadow: '0 3px 10px rgba(74,144,217,0.35)',
        }}
      >
        {loading ? 'Mengirim...' : 'Kirim Ucapan'}
      </button>
    </form>
  )
}