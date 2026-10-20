'use client'

import { useState } from 'react'
import { submitRsvp } from '@/actions/guest'

const GOLD = '#d4b26e'
const IVORY = '#f3ece0'
const TITLE = '#e6d3a6'
const MUTED = '#cdbfa8'
const BODY = '#d9cdb8'

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
          style={{ color: GOLD }}
        >
          Ubah RSVP
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="font-lux text-left">
      <p className="mb-4 text-base font-semibold" style={{ color: IVORY }}>
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
            style={{ accentColor: GOLD }}
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
            style={{ accentColor: GOLD }}
            required
          />
          <span className="text-base" style={{ color: BODY }}>Maaf, saya tidak dapat hadir</span>
        </label>
      </div>

      {status === 'attending' && (
        <div className="mb-6 animate-fade-in-up">
          <p className="text-sm font-semibold text-center italic" style={{ color: '#f0a898' }}>
            * Mohon maaf, undangan ini hanya berlaku untuk 1 orang.
          </p>
        </div>
      )}

      <button
        disabled={loading}
        type="submit"
        className="w-full py-3 rounded-md font-semibold transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: GOLD, color: '#1b1510' }}
      >
        {loading ? 'Menyimpan...' : 'Kirim Konfirmasi'}
      </button>
    </form>
  )
}