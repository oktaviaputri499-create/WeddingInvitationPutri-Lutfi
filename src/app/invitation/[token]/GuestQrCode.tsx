'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function GuestQrCode({
  token,
  guestName,
}: {
  token: string
  guestName: string
}) {
  return (
    <div className="text-center">
      <h3 className="text-xl font-serif text-dark-brown mb-1">Tiket Masuk Anda</h3>
      <p className="text-xs text-stone-600 mb-4">
        Tunjukkan QR code ini kepada penerima tamu saat tiba di acara.
      </p>
      <div className="inline-block bg-white p-4 rounded-xl shadow-md">
        <QRCodeSVG value={token} size={180} level="M" />
      </div>
      <p className="mt-3 font-bold text-dark-brown">{guestName}</p>
      <p className="font-mono text-sm tracking-widest text-gold">{token}</p>
      <p className="mt-2 text-xs text-stone-500">
        Disarankan untuk screenshot QR code ini.
      </p>
    </div>
  )
}