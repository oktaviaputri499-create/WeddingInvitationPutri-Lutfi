'use client'

import { useState } from 'react'
import { updateSettings } from '@/actions/settings'
import { TEXT_GROUPS, parseSavedTexts } from '@/lib/siteTexts'

type FormState = {
  groomName: string
  groomParents: string
  brideName: string
  brideParents: string
  weddingDate: string
  weddingTime: string
  weddingLocation: string
  welcomeMessage: string
  giftMessage: string
  bank1Name: string
  bank1Number: string
  bank1Holder: string
  bank2Name: string
  bank2Number: string
  bank2Holder: string
}

// A field is either saved data (names, date, bank...) or an editable text from siteTexts.ts
type Item =
  | { kind: 'data'; field: keyof FormState; label: string; rows?: number }
  | { kind: 'text'; key: string; label?: string }

type Section = { title: string; note?: string; items: Item[] }

// Same order as the invitation: envelope -> hero -> couple -> event -> gift -> RSVP -> wishes -> footer
const SECTIONS: Section[] = [
  {
    title: '1. Amplop (Pembuka)',
    note: 'Tampilan pertama: amplop dan kertas undangan.',
    items: [
      { kind: 'text', key: 'envTapHint' },
      { kind: 'text', key: 'envDear' },
      { kind: 'text', key: 'envInvited' },
      { kind: 'text', key: 'envMessage' },
    ],
  },
  {
    title: '2. Halaman Utama (Hero)',
    note: 'Nama depan mempelai di halaman ini diambil otomatis dari bagian Mempelai di bawah.',
    items: [
      { kind: 'text', key: 'heroEyebrow' },
      { kind: 'text', key: 'heroTagline' },
    ],
  },
  {
    title: '3. Mempelai',
    items: [
      { kind: 'text', key: 'coupleTitle' },
      { kind: 'data', field: 'groomName', label: 'Nama mempelai pria' },
      { kind: 'text', key: 'groomLabel' },
      { kind: 'data', field: 'groomParents', label: 'Orang tua mempelai pria' },
      { kind: 'data', field: 'brideName', label: 'Nama mempelai wanita' },
      { kind: 'text', key: 'brideLabel' },
      { kind: 'data', field: 'brideParents', label: 'Orang tua mempelai wanita' },
    ],
  },
  {
    title: '4. Acara',
    items: [
      { kind: 'text', key: 'eventTitle' },
      { kind: 'text', key: 'eventName' },
      { kind: 'data', field: 'weddingDate', label: 'Tanggal' },
      { kind: 'data', field: 'weddingTime', label: 'Waktu' },
      { kind: 'data', field: 'weddingLocation', label: 'Lokasi' },
      { kind: 'text', key: 'mapsButton' },
      { kind: 'text', key: 'calendarButton' },
      { kind: 'text', key: 'calDate' },
      { kind: 'text', key: 'calStart' },
      { kind: 'text', key: 'calEnd' },
    ],
  },
  {
    title: '5. Hadiah',
    items: [
      { kind: 'text', key: 'giftTitle' },
      { kind: 'data', field: 'giftMessage', label: 'Pesan hadiah', rows: 3 },
      { kind: 'data', field: 'bank1Name', label: 'Rekening 1: Nama bank' },
      { kind: 'data', field: 'bank1Number', label: 'Rekening 1: Nomor rekening' },
      { kind: 'data', field: 'bank1Holder', label: 'Rekening 1: Atas nama' },
      { kind: 'data', field: 'bank2Name', label: 'Rekening 2: Nama bank' },
      { kind: 'data', field: 'bank2Number', label: 'Rekening 2: Nomor rekening' },
      { kind: 'data', field: 'bank2Holder', label: 'Rekening 2: Atas nama' },
    ],
  },
  {
    title: '6. RSVP & Ucapan',
    items: [
      { kind: 'text', key: 'rsvpTitle' },
      { kind: 'text', key: 'wishesTitle' },
    ],
  },
  {
    title: '7. Footer',
    items: [{ kind: 'text', key: 'footerText' }],
  },
  {
    title: 'Lainnya',
    note: 'Pesan sambutan ini belum ditampilkan di undangan. Pesan di kertas amplop diatur di bagian 1.',
    items: [{ kind: 'data', field: 'welcomeMessage', label: 'Pesan sambutan', rows: 2 }],
  },
]

// Look up the text definitions (label, default, hint, input type) by key
const TEXT_BY_KEY = Object.fromEntries(TEXT_GROUPS.flatMap(g => g.fields.map(f => [f.key, f])))

export default function SettingsForm({ settings }: { settings: any }) {
  const [form, setForm] = useState<FormState>({
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
  const [texts, setTexts] = useState<Record<string, string>>(() => parseSavedTexts(settings?.texts))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTextChange = (key: string, value: string) => {
    setTexts(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await updateSettings({ ...form, texts })
      setSaved(true)
    } catch (err) {
      alert('Gagal menyimpan perubahan.')
    }
    setSaving(false)
  }

  const inputClass = "w-full p-2 border border-stone-300 rounded-md focus:outline-none focus:border-gold"
  const labelClass = "block text-sm font-bold mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm text-stone-500">
        Urutan bagian di bawah sama dengan urutan di undangan. Untuk kolom yang punya teks abu-abu, biarkan kosong jika
        ingin memakai teks bawaan tersebut.
      </p>

      {SECTIONS.map(section => (
        <div key={section.title}>
          <h2 className="text-lg font-bold mb-1 text-gold">{section.title}</h2>
          {section.note && <p className="text-xs text-stone-500 mb-3">{section.note}</p>}

          <div className="space-y-3 mt-3">
            {section.items.map(item => {
              if (item.kind === 'data') {
                return (
                  <div key={item.field}>
                    <label className={labelClass}>{item.label}</label>
                    {item.rows ? (
                      <textarea
                        rows={item.rows}
                        className={inputClass}
                        value={form[item.field]}
                        onChange={e => handleChange(item.field, e.target.value)}
                      />
                    ) : (
                      <input
                        className={inputClass}
                        value={form[item.field]}
                        onChange={e => handleChange(item.field, e.target.value)}
                      />
                    )}
                  </div>
                )
              }

              const f = TEXT_BY_KEY[item.key]
              if (!f) return null
              return (
                <div key={item.key}>
                  <label className={labelClass}>{item.label || f.label}</label>
                  {f.multiline ? (
                    <textarea
                      rows={2}
                      className={inputClass}
                      placeholder={f.def}
                      value={texts[f.key] ?? ''}
                      onChange={e => handleTextChange(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={f.input || 'text'}
                      className={inputClass}
                      placeholder={f.def}
                      value={texts[f.key] ?? ''}
                      onChange={e => handleTextChange(f.key, e.target.value)}
                    />
                  )}
                  {f.hint && <p className="text-xs text-stone-500 mt-1">{f.hint}</p>}
                </div>
              )
            })}
          </div>
        </div>
      ))}

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