export type TextField = {
  key: string
  label: string
  def: string
  multiline?: boolean
  input?: 'text' | 'date' | 'time'
  hint?: string
}

export type TextGroup = { title: string; fields: TextField[] }

export const TEXT_GROUPS: TextGroup[] = [
  {
    title: 'Amplop (Pembuka)',
    fields: [
      { key: 'envTapHint', label: 'Teks petunjuk ketuk', def: 'Ketuk untuk membuka' },
      { key: 'envDear', label: 'Sapaan di kertas', def: 'Dear our beloved guest,' },
      { key: 'envInvited', label: 'Judul di kertas', def: "You're Invited" },
      {
        key: 'envMessage',
        label: 'Pesan di kertas',
        def: 'We would love to celebrate this special day with you',
        multiline: true,
        hint: 'Daun emas selalu muncul setelah dua kata terakhir.',
      },
    ],
  },
  {
    title: 'Halaman Utama (Hero)',
    fields: [
      { key: 'heroEyebrow', label: 'Teks kecil di atas nama', def: 'The Wedding Of' },
      {
        key: 'heroTagline',
        label: 'Kalimat di bawah nama',
        def: 'Two hearts, one beautiful beginning',
        hint: 'Ikon hati selalu muncul setelah kata terakhir.',
      },
    ],
  },
  {
    title: 'Bagian Mempelai',
    fields: [
      { key: 'coupleTitle', label: 'Judul bagian', def: 'The Groom & The Bride' },
      { key: 'groomLabel', label: 'Label orang tua mempelai pria', def: 'Putra dari:' },
      { key: 'brideLabel', label: 'Label orang tua mempelai wanita', def: 'Putri dari:' },
    ],
  },
  {
    title: 'Bagian Acara',
    fields: [
      { key: 'eventTitle', label: 'Judul bagian', def: 'Wedding Event' },
      { key: 'eventName', label: 'Nama acara', def: 'Akad Nikah' },
      { key: 'mapsButton', label: 'Tombol peta', def: 'Buka Google Maps' },
      { key: 'calendarButton', label: 'Tombol kalender', def: 'Tambah ke Kalender' },
    ],
  },
  {
    title: 'Kalender (file .ics)',
    fields: [
      {
        key: 'calDate',
        label: 'Tanggal acara',
        def: '2027-03-07',
        input: 'date',
        hint: 'Dipakai tombol "Tambah ke Kalender". Jika dikosongkan, memakai 7 Maret 2027.',
      },
      { key: 'calStart', label: 'Jam mulai (WIB)', def: '08:00', input: 'time' },
      { key: 'calEnd', label: 'Jam selesai (WIB)', def: '10:00', input: 'time' },
    ],
  },
  {
    title: 'Bagian Hadiah',
    fields: [{ key: 'giftTitle', label: 'Judul bagian', def: 'Gift & Support' }],
  },
  {
    title: 'Bagian RSVP & Ucapan',
    fields: [
      { key: 'rsvpTitle', label: 'Judul RSVP', def: 'RSVP' },
      { key: 'wishesTitle', label: 'Judul ucapan', def: 'Ucapan & Doa' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      {
        key: 'footerText',
        label: 'Teks footer',
        def: '© 2026 {groom} & {bride}. All rights reserved.',
        hint: '{groom} dan {bride} otomatis diganti nama depan mempelai.',
      },
    ],
  },
]

const DEFAULTS: Record<string, string> = Object.fromEntries(
  TEXT_GROUPS.flatMap(g => g.fields.map(f => [f.key, f.def]))
)

function readSaved(raw?: string | null): Record<string, string> {
  if (!raw) return {}
  try {
    const obj = JSON.parse(raw)
    const out: Record<string, string> = {}
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string') out[k] = v
      }
    }
    return out
  } catch {
    return {}
  }
}

// Every text for the invitation AND the admin form:
// - a text the admin saved is used exactly as saved (an empty text stays empty and is hidden)
// - a text that was never saved falls back to the current default wording
export function getTexts(raw?: string | null): Record<string, string> {
  const saved = readSaved(raw)
  const out: Record<string, string> = {}
  for (const key of Object.keys(DEFAULTS)) {
    out[key] = key in saved ? saved[key] : DEFAULTS[key]
  }
  return out
}