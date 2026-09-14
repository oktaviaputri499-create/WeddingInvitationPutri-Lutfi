'use client'

import { useState } from 'react'
import { submitRsvp } from '@/actions/guest'

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
      <div className="p-6 bg-soft-green/20 text-dark-brown rounded-xl border border-soft-green/40">
        <h3 className="font-bold mb-2">Terima kasih, {guestName}.</h3>
        <p className="text-sm">Konfirmasi kehadiran Anda telah berhasil disimpan.</p>
        <button onClick={() => setSuccess(false)} className="text-xs text-gold mt-4 underline">Ubah RSVP</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="text-left bg-stone-50 p-6 rounded-xl shadow-inner border border-stone-200">
      <p className="mb-4 text-sm font-bold">Apakah Anda akan hadir?</p>
      
      <div className="space-y-3 mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="radio" name="status" value="attending" checked={status === 'attending'} onChange={() => setStatus('attending')} className="text-gold focus:ring-gold" required />
          <span className="text-sm">Ya, saya akan hadir</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="radio" name="status" value="not_attending" checked={status === 'not_attending'} onChange={() => setStatus('not_attending')} className="text-gold focus:ring-gold" required />
          <span className="text-sm">Maaf, saya tidak dapat hadir</span>
        </label>
      </div>

      {status === 'attending' && (
        <div className="mb-6 animate-fade-in-up p-3 bg-stone-100 rounded-md border border-stone-200">
          <p className="text-sm text-red-600 font-bold text-center italic">
            * Mohon maaf, undangan ini hanya berlaku untuk 1 orang.
          </p>
        </div>
      )}

      <button disabled={loading} type="submit" className="w-full bg-dark-brown text-white py-3 rounded-md hover:bg-gold transition disabled:opacity-50">
        {loading ? 'Menyimpan...' : 'Kirim Konfirmasi'}
      </button>
    </form>
  )
}
