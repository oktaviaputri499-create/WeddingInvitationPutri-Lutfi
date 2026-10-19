'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkInGuest, saveCheckInPhoto, type CheckInResult } from '@/actions/checkin'

// Shrinks the photo so it stays small (about 40-80 KB) before saving
function resizeImage(file: File, maxSize = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('load'))
    }
    img.src = url
  })
}

export default function CheckinScanner({ secret }: { secret: string }) {
  const router = useRouter()
  const scannerRef = useRef<any>(null)
  const busyRef = useRef(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [photoToken, setPhotoToken] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleToken(raw: string) {
    if (busyRef.current) return
    busyRef.current = true
    try {
      const res = await checkInGuest(raw, secret)
      setResult(res)
      setPhotoPreview('')
      setPhotoStatus('idle')
      if (res.status === 'ok' || res.status === 'already') {
        setPhotoToken(raw.trim())
      } else {
        setPhotoToken(null)
      }
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

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !photoToken) return
    setPhotoStatus('saving')
    try {
      const dataUrl = await resizeImage(file)
      setPhotoPreview(dataUrl)
      const res = await saveCheckInPhoto(photoToken, secret, dataUrl)
      if (res.ok) {
        setPhotoStatus('saved')
        router.refresh()
      } else {
        setPhotoStatus('error')
      }
    } catch {
      setPhotoStatus('error')
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

      {/* Guest photo */}
      {photoToken && (
        <div className="mt-4 p-4 rounded-lg border border-stone-200 bg-stone-50">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoStatus === 'saving'}
            className="w-full py-3 border border-dark-brown text-dark-brown rounded-md hover:bg-dark-brown hover:text-white transition disabled:opacity-50"
          >
            {photoStatus === 'saving'
              ? 'Menyimpan foto...'
              : photoStatus === 'saved'
              ? '📷 Ambil Ulang Foto'
              : '📷 Ambil Foto Tamu'}
          </button>

          {photoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Foto tamu"
              className="mt-3 w-32 h-32 object-cover rounded-lg border border-stone-300 mx-auto"
            />
          )}
          {photoStatus === 'saved' && (
            <p className="mt-2 text-sm text-green-700 text-center">✓ Foto tersimpan</p>
          )}
          {photoStatus === 'error' && (
            <p className="mt-2 text-sm text-red-600 text-center">
              Foto gagal disimpan. Coba lagi.
            </p>
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