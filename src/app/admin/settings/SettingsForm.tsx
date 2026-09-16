'use client'

import { useState } from 'react'
import { updateSettings } from '@/actions/settings'

export default function SettingsForm({ settings }: { settings: any }) {
  const [form, setForm] = useState({
    groomName: settings?.groomName || '',
    groomParents: settings?.groomParents || '',
    brideName: settings?.brideName || '',
    brideParents: settings?.brideParents || '',
    weddingDate: settings?.weddingDate || '',
    weddingTime: settings?.weddingTime || '',
    weddingLocation: settings?.weddingLocation || '',
    welcomeMessage: settings?.welcomeMessage || '',
    giftMessage: settings?.giftMessage || '',
    bank1Name: settings?.bank1Name || '',
    bank1Number: settings?.bank1Number || '',
    bank1Holder: settings?.bank1Holder || '',
    bank2Name: settings?.bank2Name || '',
    bank2Number: settings?.bank2Number || '',
    bank2Holder: settings?.bank2Holder || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await updateSettings(form)
      setSaved(true)
    } catch (err) {
      alert('Gagal menyimpan perubahan.')
    }
    setSaving(false)
  }

  const inputClass = "w-full p-2 border border-stone-300 rounded-md focus:outline-none focus:border-gold"
  const labelClass = "block text-sm font-bold mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div>
        <h2 className="text-lg font-bold mb-3 text-gold">Mempelai Pria</h2>
        <label className={labelClass}>Nama</label>
        <input className={inputClass} value={form.groomName} onChange={e => handleChange('groomName', e.target.value)} />
        <label className={labelClass + " mt-3"}>Orang Tua</label>
        <input className={inputClass} value={form.groomParents} onChange={e => handleChange('groomParents', e.target.value)} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3 text-gold">Mempelai Wanita</h2>
        <label className={labelClass}>Nama</label>
        <input className={inputClass} value={form.brideName} onChange={e => handleChange('brideName', e.target.value)} />
        <label className={labelClass + " mt-3"}>Orang Tua</label>
        <input className={inputClass} value={form.brideParents} onChange={e => handleChange('brideParents', e.target.value)} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3 text-gold">Acara</h2>
        <label className={labelClass}>Tanggal</label>
        <input className={inputClass} value={form.weddingDate} onChange={e => handleChange('weddingDate', e.target.value)} />
        <label className={labelClass + " mt-3"}>Waktu</label>
        <input className={inputClass} value={form.weddingTime} onChange={e => handleChange('weddingTime', e.target.value)} />
        <label className={labelClass + " mt-3"}>Lokasi</label>
        <input className={inputClass} value={form.weddingLocation} onChange={e => handleChange('weddingLocation', e.target.value)} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3 text-gold">Pesan</h2>
        <label className={labelClass}>Pesan Sambutan</label>
        <textarea rows={2} className={inputClass} value={form.welcomeMessage} onChange={e => handleChange('welcomeMessage', e.target.value)} />
        <label className={labelClass + " mt-3"}>Pesan Hadiah</label>
        <textarea rows={3} className={inputClass} value={form.giftMessage} onChange={e => handleChange('giftMessage', e.target.value)} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3 text-gold">Rekening 1</h2>
        <label className={labelClass}>Nama Bank</label>
        <input className={inputClass} value={form.bank1Name} onChange={e => handleChange('bank1Name', e.target.value)} />
        <label className={labelClass + " mt-3"}>Nomor Rekening</label>
        <input className={inputClass} value={form.bank1Number} onChange={e => handleChange('bank1Number', e.target.value)} />
        <label className={labelClass + " mt-3"}>Atas Nama</label>
        <input className={inputClass} value={form.bank1Holder} onChange={e => handleChange('bank1Holder', e.target.value)} />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3 text-gold">Rekening 2</h2>
        <label className={labelClass}>Nama Bank</label>
        <input className={inputClass} value={form.bank2Name} onChange={e => handleChange('bank2Name', e.target.value)} />
        <label className={labelClass + " mt-3"}>Nomor Rekening</label>
        <input className={inputClass} value={form.bank2Number} onChange={e => handleChange('bank2Number', e.target.value)} />
        <label className={labelClass + " mt-3"}>Atas Nama</label>
        <input className={inputClass} value={form.bank2Holder} onChange={e => handleChange('bank2Holder', e.target.value)} />
      </div>

      <button
        disabled={saving}
        type="submit"
        className="w-full bg-dark-brown text-white py-3 rounded-md hover:bg-gold transition disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>

      {saved && (
        <p className="text-center text-green-600 text-sm">Perubahan berhasil disimpan!</p>
      )}
    </form>
  )
}