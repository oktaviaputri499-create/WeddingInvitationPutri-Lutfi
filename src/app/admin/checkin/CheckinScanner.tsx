'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkInGuest, type CheckInResult } from '@/actions/checkin'

export default function CheckinScanner({ secret }: { secret: string }) {
  const router = useRouter()
  const scannerRef = useRef<any>(null)
  const busyRef = useRef(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState('')
  const [manualToken, setManualToken] = useState('')

  async function handleToken(raw: string) {
    if (busyRef.current) return
    busyRef.current = true
    try {
      const res = await checkInGuest(raw, secret)
      setResult(res)
      if (res.status === 'ok') router.refresh()
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      // short cooldown so the same QR is not processed repeatedly
      setTimeout(() => {
        busyRef.current = false
      }, 2500)
    }
  }

  async function startScanner() {
    setError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText: string) => {
          void handleToken(decodedText)
        },
        () => {}
      )
      setScanning(true)
    } catch {
      setError('Kamera tidak bisa dibuka. Pastikan izin kamera sudah diaktifkan.')
    }
  }

  async function stopScanner() {
    try {
      await scannerRef.current?.stop()
      scannerRef.current?.clear()
    } catch {}
    scannerRef.current = null
    setScanning(false)
  }

  useEffect(() => {
    return () => {
      const s = scannerRef.current
      if (s) s.stop().catch(() => {})
    }
  }, [])

  const styles: Record<string, string> = {
    ok: 'bg-green-50 border-green-300 text-green-800',
    already: 'bg-amber-50 border-amber-300 text-amber-800',
    invalid: 'bg-red-50 border-red-300 text-red-800',
    unauthorized: 'bg-red-50 border-red-300 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-4">
      <div
        id="qr-reader"
        className={`w-full overflow-hidden rounded-lg ${scanning ? 'mb-4' : ''}`}
      />

      {!scanning ? (
        <button
          onClick={startScanner}
          className="w-full py-3 bg-dark-brown text-white rounded-md hover:bg-gold transition"
        >
          Buka Kamera & Scan
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full py-3 border border-dark-brown text-dark-brown rounded-md hover:bg-dark-brown hover:text-white transition"
        >
          Tutup Kamera
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className={`mt-4 p-4 rounded-lg border ${styles[result.status]}`}>
          {result.status === 'ok' && (
            <>
              <p className="font-bold text-lg">✓ Check-in berhasil</p>
              <p className="text-xl font-semibold">{result.name}</p>
              <p className="text-sm">Jumlah tamu: {result.pax} orang</p>
              {result.warning && <p className="text-sm mt-1">⚠ {result.warning}</p>}
            </>
          )}
          {result.status === 'already' && (
            <>
              <p className="font-bold text-lg">Sudah check-in sebelumnya</p>
              <p className="text-xl font-semibold">{result.name}</p>
              <p className="text-sm">
                Pukul{' '}
                {new Date(result.at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Jakarta',
                })}
              </p>
            </>
          )}
          {result.status === 'invalid' && (
            <p className="font-bold">QR code tidak valid / tamu tidak ditemukan.</p>
          )}
          {result.status === 'unauthorized' && (
            <p className="font-bold">Akses ditolak. Buka halaman ini dengan ?secret=... yang benar.</p>
          )}
        </div>
      )}

      {/* Manual fallback if a guest's QR can't be scanned */}
      <div className="mt-6 pt-4 border-t border-stone-200">
        <p className="text-sm text-stone-500 mb-2">Atau masukkan kode token manual:</p>
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault()
            if (manualToken.trim()) {
              void handleToken(manualToken)
              setManualToken('')
            }
          }}
        >
          <input
            value={manualToken}
            onChange={e => setManualToken(e.target.value)}
            placeholder="Contoh: XOHDCJPD"
            className="flex-1 px-3 py-2 border border-stone-300 rounded-md font-mono text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-dark-brown text-white rounded-md text-sm hover:bg-gold transition"
          >
            Check-in
          </button>
        </form>
      </div>
    </div>
  )
}