'use client'

import { QRCodeSVG } from 'qrcode.react'

const GOLD = '#d4b26e'
const IVORY = '#f3ece0'
const TITLE = '#e6d3a6'
const MUTED = '#cdbfa8'
const BODY = '#d9cdb8'

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
          boxShadow: '0 0 0 1px rgba(212,178,110,0.5), 0 10px 24px rgba(0,0,0,0.5)',
        }}
      >
        <QRCodeSVG value={token} size={180} level="M" bgColor="#ffffff" fgColor="#000000" />
      </div>
      <p className="mt-4 text-xl font-semibold" style={{ color: IVORY }}>
        {guestName}
      </p>
      <p className="font-mono text-base tracking-widest mt-1" style={{ color: GOLD }}>
        {token}
      </p>
      <p className="mt-3 text-sm italic" style={{ color: MUTED }}>
        Disarankan untuk screenshot QR code ini.
      </p>
    </div>
  )
}