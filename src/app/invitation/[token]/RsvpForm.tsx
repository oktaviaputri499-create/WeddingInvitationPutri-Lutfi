'use client'

import { useState } from 'react'
import { submitRsvp } from '@/actions/guest'

const ACCENT = '#4a90d9'
const INK = '#23446b'
const TITLE = '#2f5d8c'
const BODY = '#35577f'

export default function RsvpForm({ token, initialRsvp, guestName }: { token: string, initialRsvp: any, guestName: string }) {
  const [status, setStatus] = useState(initialRsvp?.status || 'pending')
  const [guests, setGuests] = useState(initialRsvp?.numberOfGuests || 1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await submitRsvp(token, status, status === 'attending' ? guests : 0)
      setSuccess(true)
    } catch (err) {
      alert("Terjadi kesalahan. Silakan coba lagi.")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="font-lux text-center">
        <h3 className="font-semibold text-xl mb-2" style={{ color: TITLE }}>
          Terima kasih, {guestName}.
        </h3>
        <p className="text-base italic" style={{ color: BODY }}>
          Konfirmasi kehadiran Anda telah berhasil disimpan.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm mt-4 underline underline-offset-4 hover:opacity-80 transition"
          style={{ color: ACCENT }}
        >
          Ubah RSVP
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="font-lux text-left">
      <p className="mb-4 text-base font-semibold" style={{ color: INK }}>
        Apakah Anda akan hadir?
      </p>

      <div className="space-y-3 mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="status"
            value="attending"
            checked={status === 'attending'}
            onChange={() => setStatus('attending')}
            className="w-4 h-4"
            style={{ accentColor: ACCENT }}
            required
          />
          <span className="text-base" style={{ color: BODY }}>Ya, saya akan hadir</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="status"
            value="not_attending"
            checked={status === 'not_attending'}
            onChange={() => setStatus('not_attending')}
            className="w-4 h-4"
            style={{ accentColor: ACCENT }}
            required
          />
          <span className="text-base" style={{ color: BODY }}>Maaf, saya tidak dapat hadir</span>
        </label>
      </div>

      {status === 'attending' && (
        <div className="mb-6 animate-fade-in-up">
          <p className="text-sm font-semibold text-center italic" style={{ color: '#d6537a' }}>
            * Mohon maaf, undangan ini hanya berlaku untuk 1 orang.
          </p>
        </div>
      )}

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
        {loading ? 'Menyimpan...' : 'Kirim Konfirmasi'}
      </button>
    </form>
  )
}