'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, X } from 'lucide-react'

const GOLD = '#d4b26e'

/* ---------- Pixel couple ---------- */

const PAL: Record<string, string> = {
  H: '#5a4638', B: '#9a6a48', S: '#ffd9b8', E: '#1a1a1a', C: '#f7a8bd', K: '#454a6b',
  W: '#fff4e0', T: '#d4b26e', D: '#d9cdb8', V: '#cfc3ae', F: '#f2a0b8', P: '#1b1a22',
}

const GROOM = [
  '...HHHHHH...', '..HHHHHHHH..', '..HSSSSSSH..', '..SSESSESS..', '..SCSSSSCS..',
  '..SSSSSSSS..', '...SSSSSS...', '....SWWS....', '..KKWWWWKK..', '..KKKTTKKK..',
  '.KKFKWWKKKK.', '.KKKKWWKKKK.', '.SKKKWWKKKS.', '.SKKKKKKKKS.', '..KKKKKKKK..',
  '..KKKKKKKK..', '..KKK..KKK..', '..KKK..KKK..', '..KKK..KKK..', '..PPP..PPP..',
]

const BRIDE = [
  '...VVVVVV...', '..VBBBBBBV..', '..VBSSSSBV..', '..VSESSESV..', '..VSCSSCSV..',
  '..VSSSSSSV..', '..VBSSSSBV..', '..VBWWWWBV..', '...WWWWWW...', '..WWWWWWWW..',
  '.SSWFFFFWSS.', '..WWWWWWWW..', '.WWWWWWWWWW.', '.WWWWWWWWWW.', 'WWWWWWWWWWWW',
  'WWWWDWWDWWWW', 'WWWWWWWWWWWW', 'WDWWWWWWWWDW', 'WWWWWWWWWWWW', '.DDDDDDDDDD.',
]

function Sprite({ rows }: { rows: string[] }) {
  const rects: React.ReactNode[] = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row.charAt(x)
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

/* ---------- Pixel ornament (replaces the thin flourishes at the top and bottom) ---------- */

const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']
const DIAMOND = ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..']

function ornamentSvg() {
  const r: string[] = []
  const put = (g: string[], ox: number, oy: number, fill: string) => {
    g.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row.charAt(x) === 'X') {
          r.push(`<rect x="${ox + x}" y="${oy + y}" width="1" height="1" fill="${fill}"/>`)
        }
      }
    })
  }
  for (let i = 0; i < 7; i++) {
    const o = (0.3 + i * 0.1).toFixed(2)
    r.push(`<rect x="${i * 2}" y="4" width="1" height="1" fill="#d4b26e" opacity="${o}"/>`)
    r.push(`<rect x="${60 - i * 2}" y="4" width="1" height="1" fill="#d4b26e" opacity="${o}"/>`)
  }
  put(HEART, 16, 1, '#f2a0b8')
  put(HEART, 38, 1, '#f2a0b8')
  put(DIAMOND, 28, 2, '#d4b26e')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61 9" shape-rendering="crispEdges">${r.join('')}</svg>`
}

const ORN = `url("data:image/svg+xml;utf8,${encodeURIComponent(ornamentSvg())}")`

/* ---------- Pixel theme for the whole invitation ---------- */

const PIXEL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

html body,
html body input,html body textarea,html body select,html body button,
.font-lux,.font-script,.font-mono,h1,h2,h3{font-family:'Pixelify Sans',ui-monospace,Menlo,monospace !important;}

.italic{font-style:normal !important;}
.font-script{font-weight:600;letter-spacing:.02em;}
h1.font-script{font-size:clamp(1.9rem,9vw,2.8rem) !important;line-height:1.3 !important;}
h2.font-script{font-size:30px !important;line-height:1.3 !important;}

/* square pixel corners */
.rounded-full,.rounded-sm,.rounded-lg,.rounded-md,.rounded-xl{border-radius:0 !important;}

/* thick pixel frames */
[style*="border:1px solid"],[style*="border: 1px solid"]{border-width:3px !important;}

/* pixel ornament instead of the thin flourishes */
div[aria-hidden="true"]:has(> svg[viewBox="0 0 240 40"]){
  width:min(70%,260px) !important;height:22px;
  background:${ORN} center / contain no-repeat;image-rendering:pixelated;}
div[aria-hidden="true"] > svg[viewBox="0 0 240 40"]{display:none;}
`

/* ---------- Couple animation ---------- */

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

      {[
        { l: -14, t: 10, d: '0s' },
        { l: 112, t: -8, d: '-.8s' },
        { l: 168, t: 24, d: '-1.6s' },
        { l: 6, t: 70, d: '-1.2s' },
      ].map((s, i) => (
        <span
          key={i}
          className="cp-tw absolute"
          style={{ left: s.l, top: s.t, width: 4, height: 4, background: GOLD, animationDelay: s.d }}
          aria-hidden
        />
      ))}

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
      <style>{PIXEL_CSS}</style>

      <Couple />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-lux inline-flex items-center justify-center gap-2 px-7 py-2 mt-6 text-sm border-2 transition hover:bg-[#d4b26e] hover:text-[#1b1510]"
        style={{
          borderColor: GOLD,
          color: GOLD,
          textShadow: 'none',
          boxShadow: '3px 3px 0 rgba(212,178,110,0.3)',
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
              className="absolute right-4 top-4 z-10 w-10 h-10 bg-white/90 text-black flex items-center justify-center"
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