'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

const ACCENT = '#4a90d9'

export default function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const copy = async () => {
    // Copy digits only, so it pastes cleanly into a banking app
    const text = value.replace(/[\s-]/g, '')
    let ok = false

    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      // Fallback for older browsers / non-https
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.top = '0'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ta.setSelectionRange(0, text.length)
        ok = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        ok = false
      }
    }

    if (ok) {
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied!' : label}
      className="shrink-0 inline-flex items-center justify-center transition hover:bg-[#4a90d9] hover:text-white"
      style={{
        width: 34,
        height: 34,
        border: `2px solid ${ACCENT}`,
        color: copied ? '#ffffff' : ACCENT,
        backgroundColor: copied ? ACCENT : 'rgba(255,255,255,0.7)',
        boxShadow: '2px 2px 0 rgba(74,144,217,0.3)',
        textShadow: 'none',
        cursor: 'pointer',
      }}
    >
      {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} />}
    </button>
  )
}