'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, X } from 'lucide-react'

const GOLD = '#d4b26e'

export default function OurStoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-lux inline-flex items-center justify-center gap-2 px-7 py-2 mt-10 text-sm rounded-full border transition hover:bg-[#d4b26e] hover:text-[#1b1510]"
        style={{
          borderColor: GOLD,
          color: GOLD,
          textShadow: 'none',
          animation: 'heroFade 1.4s ease-out 2.4s both',
        }}
      >
        <BookOpen size={16} />
        Our Story
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/80">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center"
            >
              <X size={20} />
            </button>
            <iframe src="/our-story.html" title="Our Story" className="w-full h-full border-0" />
          </div>,
          document.body
        )}
    </>
  )
}