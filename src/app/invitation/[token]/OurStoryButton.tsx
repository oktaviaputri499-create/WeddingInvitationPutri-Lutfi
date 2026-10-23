'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, X } from 'lucide-react'

const GOLD = '#d4b26e'

// Pixel art: each letter is one pixel (12 wide x 20 tall)
const PAL: Record<string, string> = {
  H: '#5a4638', // groom hair
  B: '#9a6a48', // bride hair
  S: '#ffd9b8', // skin
  E: '#1a1a1a', // eyes
  C: '#f7a8bd', // cheeks
  K: '#454a6b', // groom suit
  W: '#fff4e0', // white
  T: '#d4b26e', // gold bow tie
  D: '#d9cdb8', // dress shadow
  V: '#cfc3ae', // veil
  F: '#f2a0b8', // flowers
  P: '#1b1a22', // shoes
}

const GROOM = [
  '...HHHHHH...',
  '..HHHHHHHH..',
  '..HSSSSSSH..',
  '..SSESSESS..',
  '..SCSSSSCS..',
  '..SSSSSSSS..',
  '...SSSSSS...',
  '....SWWS....',
  '..KKWWWWKK..',
  '..KKKTTKKK..',
  '.KKFKWWKKKK.',
  '.KKKKWWKKKK.',
  '.SKKKWWKKKS.',
  '.SKKKKKKKKS.',
  '..KKKKKKKK..',
  '..KKKKKKKK..',
  '..KKK..KKK..',
  '..KKK..KKK..',
  '..KKK..KKK..',
  '..PPP..PPP..',
]

const BRIDE = [
  '...VVVVVV...',
  '..VBBBBBBV..',
  '..VBSSSSBV..',
  '..VSESSESV..',
  '..VSCSSCSV..',
  '..VSSSSSSV..',
  '..VBSSSSBV..',
  '..VBWWWWBV..',
  '...WWWWWW...',
  '..WWWWWWWW..',
  '.SSWFFFFWSS.',
  '..WWWWWWWW..',
  '.WWWWWWWWWW.',
  '.WWWWWWWWWW.',
  'WWWWWWWWWWWW',
  'WWWWDWWDWWWW',
  'WWWWWWWWWWWW',
  'WDWWWWWWWWDW',
  'WWWWWWWWWWWW',
  '.DDDDDDDDDD.',
]

function Sprite({ rows }: { rows: string[] }) {
  const rects: React.ReactNode[] = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x]
      if (c !== '.') {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PAL[c]} />)
      }
    }
  })
  return (
    <svg viewBox="0 0 12 20" width={72} height={120} shapeRendering="crispEdges" aria-hidden>
      {rects}
    </svg>
  )
}

const coupleCss = `
@keyframes cpFade{from{opacity:0}to{opacity:1}}
@keyframes cpBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes cpHeart{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-5px) scale(1.25)}}
@keyframes cpTw{0%,100%{opacity:.15}50%{opacity:1}}
.cp-bob{animation:cpBob 2.2s ease-in-out infinite;}
.cp-heart{animation:cpHeart 1.8s ease-in-out infinite;}
.cp-tw{animation:cpTw 2.4s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){.cp-bob,.cp-heart,.cp-tw{animation:none;}}
`

function Couple() {
  return (
    <div
      className="relative mt-10 flex items-end justify-center gap-3"
      style={{ animation: 'cpFade 1.6s ease-out 2.4s both' }}
    >
      <style>{coupleCss}</style>

      <div className="cp-bob">
        <Sprite rows={GROOM} />
      </div>

      <span
        className="cp-heart absolute"
        style={{ left: '50%', top: -6, marginLeft: -8, color: '#f2a0b8', fontSize: 16, lineHeight: 1 }}
        aria-hidden
      >
        ♥
      </span>

      <div className="cp-bob" style={{ animationDelay: '-1.1s' }}>
        <Sprite rows={BRIDE} />
      </div>

      {/* Twinkling sparkles */}
      {[
        { l: -14, t: 10, d: '0s' },
        { l: 112, t: -8, d: '-.8s' },
        { l: 168, t: 24, d: '-1.6s' },
        { l: 6, t: 70, d: '-1.2s' },
      ].map((s, i) => (
        <span
          key={i}
          className="cp-tw absolute"
          style={{
            left: s.l,
            top: s.t,
            width: 4,
            height: 4,
            background: GOLD,
            animationDelay: s.d,
          }}
          aria-hidden
        />
      ))}

      {/* Ground line */}
      <div
        className="absolute left-0 right-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,#d4b26e,transparent)' }}
      />
    </div>
  )
}

export default function OurStoryButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Couple />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-lux inline-flex items-center justify-center gap-2 px-7 py-2 mt-6 text-sm rounded-full border transition hover:bg-[#d4b26e] hover:text-[#1b1510]"
        style={{
          borderColor: GOLD,
          color: GOLD,
          textShadow: 'none',
          animation: 'heroFade 1.4s ease-out 3.2s both',
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