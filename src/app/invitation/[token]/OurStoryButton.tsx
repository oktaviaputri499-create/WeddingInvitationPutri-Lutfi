'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, X } from 'lucide-react'

const ACCENT = '#4a90d9'

/* ---------- Pixel couple ---------- */

const PAL: Record<string, string> = {
  H: '#5a4638', B: '#9a6a48', S: '#ffd9b8', E: '#1a1a1a', C: '#f7a8bd', K: '#3d6fa8',
  W: '#ffffff', T: '#9cc3ea', D: '#cfe0f2', V: '#dbe9f7', F: '#f2a0b8', P: '#23324a',
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

/* ---------- Pixel cat that sits between the couple ---------- */

// O = outline, G = gray, L = light gray, P = pink ear, B = blush, N = nose
const CAT_COLORS: Record<string, string> = {
  O: '#2f4a73',
  G: '#a9a9b5',
  L: '#d7d7e0',
  P: '#f4a3b8',
  B: '#f7b6c8',
  N: '#f08aa4',
}

const CAT = [
  '.OO.......OO.',
  '.OPO.....OPO.',
  '.OPPOOOOOPPO.',
  'OGGGGGGGGGGGO',
  'OGGGGGGGGGGGO',
  'OGGGGGGGGGGGO',
  'OGBGGLNLGGBGO',
  'OGGGGLOLGGGGO',
  '.OGGGGGGGGGO.',
  '.OGGGLLLGGGO.',
  '.OGGGLLLGGGO.',
  '.OLLOGGGOLLO.',
  '.OOOOOOOOOOO.',
]

function Cat() {
  const rects: React.ReactNode[] = []
  CAT.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row.charAt(x)
      if (c in CAT_COLORS) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={CAT_COLORS[c]} />)
      }
    }
  })
  return (
    <svg viewBox="0 0 17 13" width="100%" shapeRendering="crispEdges" aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      {/* Tail (wags) */}
      <g className="cat-tail" style={{ transformOrigin: '13px 11.5px' }}>
        <rect x={13} y={11} width={2} height={1.02} fill="#8e8e9c" />
        <rect x={14} y={10} width={2} height={1.02} fill="#8e8e9c" />
        <rect x={15} y={9} width={1.02} height={1.02} fill="#8e8e9c" />
        <rect x={15} y={8} width={1.02} height={1.02} fill="#d7d7e0" />
      </g>

      {rects}

      {/* Eyes (blink) */}
      <rect className="cat-eye" x={3} y={4} width={1.02} height={2.04} fill="#1f2a44" />
      <rect className="cat-eye" x={9} y={4} width={1.02} height={2.04} fill="#1f2a44" />
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
    r.push(`<rect x="${i * 2}" y="4" width="1" height="1" fill="#4a90d9" opacity="${o}"/>`)
    r.push(`<rect x="${60 - i * 2}" y="4" width="1" height="1" fill="#4a90d9" opacity="${o}"/>`)
  }
  put(HEART, 16, 1, '#f2a0b8')
  put(HEART, 38, 1, '#f2a0b8')
  put(DIAMOND, 28, 2, '#4a90d9')
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

/* Hero names: bold pixel capitals with extra spacing and a hard pixel shadow, so they stay readable */
html body section h1.hero-names{
  font-family:'Pixelify Sans',ui-monospace,Menlo,monospace !important;
  font-weight:600 !important;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-size:clamp(1.6rem,6.8vw,2.2rem) !important;
  line-height:1.25 !important;
  text-shadow:2px 2px 0 rgba(74,144,217,.28) !important;}

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
@keyframes catTail{from{transform:rotate(-14deg)}to{transform:rotate(12deg)}}
@keyframes catBlink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.15)}}
@keyframes catHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.cp-bob{animation:cpBob 2.2s ease-in-out infinite;}
.cp-heart{animation:cpHeart 1.8s ease-in-out infinite;}
.cp-tw{animation:cpTw 2.4s ease-in-out infinite;}
.cat-tail{animation:catTail 1.1s ease-in-out infinite alternate;}
.cat-eye{transform-box:fill-box;transform-origin:50% 50%;animation:catBlink 4.5s ease-in-out infinite;}
.cat-btn{-webkit-tap-highlight-color:transparent;}
.cat-btn:hover .cat-hop,.cat-btn:focus-visible .cat-hop{animation:catHop .5s ease-in-out infinite;}
.cat-btn:focus-visible{outline:2px dashed #4a90d9;outline-offset:2px;}
@media (prefers-reduced-motion:reduce){.cp-bob,.cp-heart,.cp-tw,.cat-tail,.cat-eye,.cat-btn:hover .cat-hop{animation:none;}}
`

function Couple({ onCatClick }: { onCatClick: () => void }) {
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

      {/* The cat sits on the ground between the two. Tap it to play with Bubu */}
      <button
        type="button"
        onClick={onCatClick}
        aria-label="Play with Bubu"
        title="Play with Bubu"
        className="cat-btn absolute"
        style={{
          left: '50%',
          marginLeft: -35,
          bottom: -5,
          width: 54,
          padding: 6,
          zIndex: 5,
          background: 'none',
          border: 0,
          cursor: 'pointer',
          animation: 'cpFade 1.2s ease-out 3.2s both',
        }}
      >
        <div className="cat-hop">
          <Cat />
        </div>
      </button>

      {[
        { l: -14, t: 10, d: '0s' },
        { l: 112, t: -8, d: '-.8s' },
        { l: 168, t: 24, d: '-1.6s' },
        { l: 6, t: 70, d: '-1.2s' },
      ].map((s, i) => (
        <span
          key={i}
          className="cp-tw absolute"
          style={{ left: s.l, top: s.t, width: 4, height: 4, background: ACCENT, animationDelay: s.d }}
          aria-hidden
        />
      ))}

      <div
        className="absolute left-0 right-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,#4a90d9,transparent)' }}
      />
    </div>
  )
}

/*
  part="hero"   (default) -> pixel theme + couple + Bubu the cat (used on the first page)
  part="button"           -> the "Our Story" button + story popup (used in its own section)
*/
export default function OurStoryButton({ part = 'hero' }: { part?: 'hero' | 'button' }) {
  const [open, setOpen] = useState(false)
  const [bubuOpen, setBubuOpen] = useState(false)

  if (part === 'hero') {
    return (
      <>
        <style>{PIXEL_CSS}</style>

        <Couple onCatClick={() => setBubuOpen(true)} />

        {bubuOpen &&
          createPortal(
            <div className="fixed inset-0 z-[100] bg-[#23446b]/80">
              <button
                type="button"
                onClick={() => setBubuOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 w-10 h-10 bg-white/90 text-[#23446b] flex items-center justify-center"
              >
                <X size={20} />
              </button>
              <iframe src="/bubu.html" title="Bubu's House" className="w-full h-full border-0" />
            </div>,
            document.body
          )}
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-lux inline-flex items-center justify-center gap-2 px-7 py-2 text-sm border-2 transition hover:bg-[#4a90d9] hover:text-white"
        style={{
          borderColor: ACCENT,
          color: ACCENT,
          backgroundColor: 'rgba(255,255,255,0.7)',
          textShadow: 'none',
          boxShadow: '3px 3px 0 rgba(74,144,217,0.3)',
        }}
      >
        <BookOpen size={16} />
        Our Story
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-[#23446b]/80">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 w-10 h-10 bg-white/90 text-[#23446b] flex items-center justify-center"
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