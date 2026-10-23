'use client'

import { QRCodeSVG } from 'qrcode.react'

const ACCENT = '#4a90d9'
const INK = '#23446b'
const TITLE = '#2f5d8c'
const MUTED = '#5f82a8'
const BODY = '#35577f'

export default function GuestQrCode({
  token,
  guestName,
}: {
  token: string
  guestName: string
}) {
  return (
    <div className="font-lux text-center">
      <h3 className="font-script text-4xl mb-2" style={{ color: TITLE }}>
        Tiket Masuk Anda
      </h3>
      <p className="text-base italic mb-5" style={{ color: BODY }}>
        Tunjukkan QR code ini kepada penerima tamu saat tiba di acara.
      </p>
      <div
        className="inline-block bg-white p-4 rounded-xl"
        style={{
          boxShadow: '0 0 0 1px rgba(74,144,217,0.5), 0 10px 24px rgba(47,93,140,0.25)',
        }}
      >
        <QRCodeSVG value={token} size={180} level="M" bgColor="#ffffff" fgColor="#000000" />
      </div>
      <p className="mt-4 text-xl font-semibold" style={{ color: INK }}>
        {guestName}
      </p>
      <p className="font-mono text-base tracking-widest mt-1" style={{ color: ACCENT }}>
        {token}
      </p>
      <p className="mt-3 text-sm italic" style={{ color: MUTED }}>
        Disarankan untuk screenshot QR code ini.
      </p>
    </div>
  )
}