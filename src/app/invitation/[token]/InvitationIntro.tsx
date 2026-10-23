'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'opening' | 'card' | 'pull' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'opening', 'card', 'pull', 'fade', 'done']

/* ---------- Pixel palette (change the colors here) ---------- */
const DARK = '#2f5d8c' // outlines
const SIDE = '#dcecfb' // left and right folds
const BOTTOM = '#eaf4fd' // bottom fold
const LINING = '#7fb2e5' // inside of the envelope
const FLAP = '#f2f8ff' // top flap (outside)
const FLAP_BACK = '#a9cdf0' // top flap (inside, once opened)
const SEAL = '#e0456f' // heart seal
const SEAL_HI = '#ff9db9'

const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: i % 5 === 0 ? 6 : 4,
  duration: 2 + (i % 4),
  delay: -((i * 7) % 5),
}))

const HEARTS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 37) % 100,
  scale: 3 + (i % 3),
  duration: 10 + ((i * 13) % 7),
  delay: -((i * 29) % 12),
  dx: (i % 2 ? 1 : -1) * (20 + ((i * 11) % 50)),
  color: ['#f4a0bf', '#ffd6e4', '#ffffff', '#9cc3ea'][i % 4],
}))

// Fine paper grain (used on the invitation card)
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.5 0 0 0 0 0.8 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`

/* ---------- Pixel helpers ---------- */

type Run = { x: number; y: number; w: number }
type Rect = Run & { c: string }
type PRect = { x: number; y: number; w: number; ch: string }

// Turns rows of characters into horizontal runs (one <rect> per run)
function patternRects(rows: string[], has: (ch: string) => boolean): PRect[] {
  const out: PRect[] = []
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]
    let x = 0
    while (x < row.length) {
      const ch = row.charAt(x)
      if (!has(ch)) {
        x += 1
        continue
      }
      let e = x + 1
      while (e < row.length && row.charAt(e) === ch) e += 1
      out.push({ x, y, w: e - x, ch })
      x = e
    }
  }
  return out
}

const reverseStr = (s: string) => s.split('').reverse().join('')

/* ---------- Envelope geometry (40 x 26 pixels) ---------- */

const W = 40
const H = 26
const ARM = 11 // row where the V of the top flap ends
const LOW = 13 // rows used by the lower diagonals

const armX = (y: number) => Math.round((19 * y) / ARM)
const lowX = (t: number) => Math.round((19 * t) / LOW)
const mirrorRun = (r: Run): Run => ({ x: W - r.x - r.w, y: r.y, w: r.w })

// Left half of the V (top flap edge), one run per row
const UPPER: Run[] = Array.from({ length: ARM + 1 }, (_, y) => {
  const lo = armX(y)
  const hi = y < ARM ? Math.max(lo, armX(y + 1) - 1) : lo
  return { x: lo, y, w: hi - lo + 1 }
})

// Left half of the lower diagonals (bottom corner to the center), indexed from the bottom row up
const LOWER: Run[] = Array.from({ length: LOW + 1 }, (_, t) => {
  const lo = lowX(t)
  const hi = t < LOW ? Math.max(lo, lowX(t + 1) - 1) : lo
  return { x: lo, y: H - 1 - t, w: hi - lo + 1 }
})

const ARMS: Run[] = UPPER.concat(UPPER.map(mirrorRun), LOWER, LOWER.map(mirrorRun))

// Fills of the front pocket: two side folds and the bottom fold
const FRONT_FILLS: Rect[] = []
for (let y = 0; y < H; y++) {
  if (y <= ARM) {
    const lo = UPPER[y].x
    if (lo > 1) {
      FRONT_FILLS.push({ x: 1, y, w: lo - 1, c: SIDE })
      FRONT_FILLS.push({ x: W - lo, y, w: lo - 1, c: SIDE })
    }
  } else {
    const run = LOWER[H - 1 - y]
    const lo = run.x
    if (lo > 1) {
      FRONT_FILLS.push({ x: 1, y, w: lo - 1, c: SIDE })
      FRONT_FILLS.push({ x: W - lo, y, w: lo - 1, c: SIDE })
    }
    const start = lo + run.w
    const width = W - 2 * start
    if (width > 0) FRONT_FILLS.push({ x: start, y, w: width, c: BOTTOM })
  }
}

// Fill of the top flap (the triangle between the two arms of the V)
const FLAP_FILLS: Run[] = []
for (let y = 1; y < ARM; y++) {
  const start = UPPER[y].x + UPPER[y].w
  const width = W - 2 * start
  if (width > 0) FLAP_FILLS.push({ x: start, y, w: width })
}

const SEAL_ROWS = ['XX..XX', 'XhXXXX', 'XXXXXX', '.XXXX.', '..XX..']
const SEAL_RECTS = patternRects(SEAL_ROWS, ch => ch !== '.')

function EnvBack({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" aria-hidden>
      <rect x={0} y={0} width={W} height={H} fill={LINING} />
      <rect x={0} y={0} width={W} height={1} fill={DARK} />
      <rect x={0} y={H - 1} width={W} height={1} fill={DARK} />
      <rect x={0} y={0} width={1} height={H} fill={DARK} />
      <rect x={W - 1} y={0} width={1} height={H} fill={DARK} />
    </svg>
  )
}

function EnvFront({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" aria-hidden>
      {FRONT_FILLS.map((r, i) => (
        <rect key={`f${i}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
      {ARMS.map((r, i) => (
        <rect key={`a${i}`} x={r.x} y={r.y} width={r.w} height={1} fill={DARK} />
      ))}
      <rect x={0} y={0} width={1} height={H} fill={DARK} />
      <rect x={W - 1} y={0} width={1} height={H} fill={DARK} />
      <rect x={0} y={H - 1} width={W} height={1} fill={DARK} />
    </svg>
  )
}

function FlapFace({ className, fill, seal }: { className?: string; fill: string; seal?: boolean }) {
  const arms = UPPER.concat(UPPER.map(mirrorRun))
  return (
    <svg className={className} viewBox={`0 0 ${W} ${ARM + 1}`} shapeRendering="crispEdges" aria-hidden>
      {FLAP_FILLS.map((r, i) => (
        <rect key={`f${i}`} x={r.x} y={r.y} width={r.w} height={1} fill={fill} />
      ))}
      {seal &&
        SEAL_RECTS.map((r, i) => (
          <rect
            key={`s${i}`}
            x={17 + r.x}
            y={5 + r.y}
            width={r.w}
            height={1}
            fill={r.ch === 'h' ? SEAL_HI : SEAL}
          />
        ))}
      <rect x={0} y={0} width={W} height={1} fill={DARK} />
      {arms.map((r, i) => (
        <rect key={`a${i}`} x={r.x} y={r.y} width={r.w} height={1} fill={DARK} />
      ))}
    </svg>
  )
}

/* ---------- The pixel cat (22 x 14 pixels) ---------- */

// Left half of the head; the right half is mirrored automatically
const CAT_HALF = [
  '..OO.......',
  '.OPPO......',
  '.OPPPO.....',
  '.OPPPGOOOOO',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OGGGGGGGGGG',
  'OOOOOOOOOOO',
]

const CAT_GRID: string[][] = CAT_HALF.map(h => (h + reverseStr(h)).split(''))

// Sets a pixel and its mirror image
const put = (x: number, y: number, ch: string) => {
  CAT_GRID[y][x] = ch
  CAT_GRID[y][21 - x] = ch
}

// Muzzle
for (let y = 9; y <= 11; y++) for (let x = 8; x <= 10; x++) put(x, y, 'L')
put(9, 8, 'L')
put(10, 8, 'L')
// Forehead stripes
put(10, 4, 'S')
put(10, 5, 'S')
put(8, 4, 'S')
// Eyes (white part; the pupils move separately)
for (let y = 6; y <= 7; y++) for (let x = 4; x <= 6; x++) put(x, y, 'W')
// Blush and whiskers
put(3, 8, 'B')
put(4, 8, 'B')
put(2, 9, 'H')
put(3, 9, 'H')
put(2, 11, 'H')
put(3, 11, 'H')
// Nose and mouth
put(10, 9, 'N')
put(9, 10, 'O')
put(10, 11, 'O')

const CAT_ROWS = CAT_GRID.map(r => r.join(''))

const CAT_COLORS: Record<string, string> = {
  O: DARK,
  G: '#9b9ba6',
  L: '#c3c3cc',
  P: '#f4a3b8',
  B: '#f4a3b8',
  N: '#f08aa4',
  W: '#f4f4f8',
  S: '#5d5d6a',
  H: '#6a6a77',
}
const CAT_RECTS = patternRects(CAT_ROWS, ch => ch in CAT_COLORS)

function Cat() {
  return (
    <svg viewBox="0 0 22 14" shapeRendering="crispEdges" aria-hidden>
      {CAT_RECTS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={CAT_COLORS[r.ch]} />
      ))}
      <g className="px-pupils">
        <rect x={5} y={6} width={1} height={2} fill="#22222c" />
        <rect x={16} y={6} width={1} height={2} fill="#22222c" />
      </g>
    </svg>
  )
}

/* ---------- Falling pixel hearts ---------- */

const HEART_ROWS = ['XX..XX', 'XXXXXX', 'XXXXXX', '.XXXX.', '..XX..']
const HEART_RECTS = patternRects(HEART_ROWS, ch => ch !== '.')

function PixelHeart({ color, scale, style }: { color: string; scale: number; style: React.CSSProperties }) {
  return (
    <svg
      className="px-heart"
      width={6 * scale}
      height={5 * scale}
      viewBox="0 0 6 5"
      shapeRendering="crispEdges"
      style={style}
    >
      {HEART_RECTS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={color} />
      ))}
    </svg>
  )
}

/* ---------- The invitation paper that slides out of the envelope ---------- */
// A text that is empty is not shown (the guest name always is).
function Card({
  guestName,
  texts,
}: {
  guestName: string
  texts?: { dear?: string; invited?: string; message?: string }
}) {
  const dear = texts?.dear ?? 'Dear our beloved guest,'
  const invited = texts?.invited ?? "You're Invited"
  const message = texts?.message ?? 'We would love to celebrate this special day with you'

  // The blue leaf sits right after the last two words
  const words = message.trim().split(/\s+/).filter(Boolean)
  const tail = words.slice(-2).join(' ')
  const head = words.slice(0, -2).join(' ')

  return (
    <div className="card" aria-hidden>
      <div className="card-bob">
        <div className="card-face" style={{ backgroundImage: `${GRAIN}, linear-gradient(180deg,#ffffff,#e6f2fd)` }}>
          <div className="card-frame" />
          <div className="card-text">
            {/* This block is as wide as the title, so the left-aligned line lines up with it */}
            <div className="card-block">
              {dear && <div className="card-dear">{dear}</div>}
              <div className="card-guest">{guestName}</div>

              {invited && (
                <>
                  <div className="card-rule" />
                  <div className="card-invited">{invited}</div>
                  <div className="card-rule" />
                </>
              )}
            </div>

            {words.length > 0 && (
              <div className="card-msg">
                {head}
                {head ? ' ' : ''}
                <span className="card-end">
                  {tail}
                  <svg className="card-leaf" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4.5 19.5 C3.5 10.5 10 4 20 4 C20.5 13.5 14.5 20 4.5 19.5 Z"
                      stroke="#4a90d9"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                    <path d="M4.5 19.5 L15.5 8.5" stroke="#4a90d9" strokeWidth="1" strokeLinecap="round" />
                    <path
                      d="M9.5 14.5 L9 10.8 M12 12 L15.2 12.4"
                      stroke="#4a90d9"
                      strokeWidth=".8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Pinyon+Script&family=Pixelify+Sans:wght@400;600&display=swap');

/* --u is the size of one pixel. The envelope is 40 x 26 pixels, the cat 22 x 14. */
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;background:#8ec5f5;cursor:pointer;
  --u:calc(min(88vw,560px,100vh) / 40);
  --ew:calc(var(--u) * 40);
  --eh:calc(var(--u) * 26);
  --ey:64%;
  -webkit-tap-highlight-color:transparent;
  transition:opacity 1.2s ease,visibility 1.2s;}
@supports (width: round(down,10.5px,1px)){
  .inv-root{--u:round(down,calc(min(88vw,560px,100vh) / 40),1px);}
}
.inv-root.is-open{cursor:default;}
.inv-root.is-card{cursor:pointer;}
.inv-root.is-pull{cursor:default;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}
.inv-root:focus-visible{outline:none;}

/* ---------- Soft blue sky with pixel sparkles ---------- */
.px-bg{position:absolute;inset:0;z-index:0;
  background:linear-gradient(#7fbcf2 0 25%,#98cbf6 25% 50%,#b6dafa 50% 75%,#d3e9fc 75%);}
.px-star{position:absolute;background:#ffffff;animation:pxTwinkle 3s steps(1,end) infinite;}
@keyframes pxTwinkle{0%{opacity:.95}50%{opacity:.3}100%{opacity:.95}}

/* ---------- Envelope layers (all share the same box) ---------- */
.px-svg{position:absolute;display:block;
  left:calc(50% - var(--ew) / 2);top:calc(var(--ey) - var(--eh) / 2);
  width:var(--ew);height:var(--eh);}
.px-back{z-index:2;}
.px-front{z-index:4;}
.px-shadow{position:absolute;z-index:0;background:rgba(47,93,140,.28);
  left:calc(50% - var(--ew) / 2 + var(--u) * 2);width:calc(var(--ew) - var(--u) * 4);
  top:calc(var(--ey) + var(--eh) / 2);height:calc(var(--u) * 1.5);}

/* ---------- The cat: pops up behind the envelope, peeks left and right, ducks down ---------- */
.px-cat-box{position:absolute;z-index:1;
  left:calc(50% - var(--u) * 11);top:calc(var(--ey) - var(--eh) / 2 - var(--u) * 12);
  width:calc(var(--u) * 22);height:calc(var(--u) * 14);}
.px-cat{width:100%;height:100%;animation:pxPeek 9s steps(1,end) infinite;}
.px-cat svg{display:block;width:100%;height:100%;}
@keyframes pxPeek{
  0%{transform:translate(0,calc(var(--u) * 12))}
  5%{transform:translate(0,calc(var(--u) * 9))}
  10%{transform:translate(0,calc(var(--u) * 6))}
  15%{transform:translate(0,calc(var(--u) * 3))}
  20%{transform:translate(0,0)}
  30%{transform:translate(calc(var(--u) * -2),0)}
  42%{transform:translate(0,0)}
  52%{transform:translate(calc(var(--u) * 2),0)}
  64%{transform:translate(0,0)}
  72%{transform:translate(0,calc(var(--u) * 3))}
  78%{transform:translate(0,calc(var(--u) * 6))}
  84%{transform:translate(0,calc(var(--u) * 9))}
  90%{transform:translate(0,calc(var(--u) * 12))}
  100%{transform:translate(0,calc(var(--u) * 12))}
}
.px-pupils{animation:pxLook 9s steps(1,end) infinite;}
@keyframes pxLook{
  0%{transform:translateX(0)}
  26%{transform:translateX(-1px)}
  40%{transform:translateX(0)}
  48%{transform:translateX(1px)}
  62%{transform:translateX(0)}
  100%{transform:translateX(0)}
}
.is-open .px-cat{animation:pxDuck .45s steps(4,end) forwards;}
@keyframes pxDuck{from{transform:translate(0,0)}to{transform:translate(0,calc(var(--u) * 12))}}

/* ---------- Top flap: flips open in pixel-like steps ---------- */
.px-flap-box{position:absolute;z-index:5;
  left:calc(50% - var(--ew) / 2);top:calc(var(--ey) - var(--eh) / 2);
  width:var(--ew);height:calc(var(--u) * 12);}
.px-flap{position:absolute;inset:0;transform-origin:50% 0;}
.px-face{position:absolute;inset:0;width:100%;height:100%;display:block;}
.px-face-back{opacity:0;}
.is-open .px-flap-box{animation:pxFlapZ 1.2s steps(1,end) forwards;}
.is-open .px-flap{animation:pxFlip 1.2s steps(6,end) forwards;}
.is-open .px-face-front{animation:pxFaceFront 1.2s steps(1,end) forwards;}
.is-open .px-face-back{animation:pxFaceBack 1.2s steps(1,end) forwards;}
@keyframes pxFlapZ{0%{z-index:5}50%{z-index:2}100%{z-index:2}}
@keyframes pxFlip{
  from{transform:perspective(700px) rotateX(0deg)}
  to{transform:perspective(700px) rotateX(180deg)}
}
@keyframes pxFaceFront{0%{opacity:1}50%{opacity:0}100%{opacity:0}}
@keyframes pxFaceBack{0%{opacity:0}50%{opacity:1}100%{opacity:1}}

/* ---------- The invitation paper: clipped at the bottom of the envelope while it rises ---------- */
.px-cardclip{position:absolute;inset:0;z-index:3;pointer-events:none;
  clip-path:inset(0 0 calc(100% - (var(--ey) + var(--eh) / 2)) 0);}
.card{position:absolute;left:50%;top:0;
  width:min(80vw,52vh);height:min(94vh,170vw);
  transform:translate(-50%,calc(64vh - var(--eh) / 2 + var(--u) * 2)) scale(.88);
  transform-origin:50% 0;will-change:transform;}
.is-open .card{animation:cardRise 1.6s cubic-bezier(.25,.7,.2,1) 1s forwards;}
@keyframes cardRise{
  from{transform:translate(-50%,calc(64vh - var(--eh) / 2 + var(--u) * 2)) scale(.88)}
  to{transform:translate(-50%,3vh) scale(.88)}
}

/* ---------- Guest taps again: card grows, the envelope slides away ---------- */
.is-pull .card{animation:cardPull 1.6s cubic-bezier(.55,0,.2,1) forwards;}
@keyframes cardPull{
  from{transform:translate(-50%,3vh) scale(.88)}
  to{transform:translate(-50%,2vh) scale(1)}
}
.is-pull .px-cardclip{animation:pxClipOpen 1.3s ease-in forwards;}
@keyframes pxClipOpen{
  from{clip-path:inset(0 0 calc(100% - (var(--ey) + var(--eh) / 2)) 0)}
  to{clip-path:inset(0 0 0 0)}
}
.is-pull .px-flap-box{z-index:2;}
.is-pull .px-slide{animation:pxEnvOut 1.5s cubic-bezier(.65,0,.25,1) forwards;}
@keyframes pxEnvOut{from{transform:translateY(0)}to{transform:translateY(120vh)}}

/* ---------- Card look: light paper, thin blue double frame (matches the invitation page) ---------- */
.card-bob{position:absolute;inset:0;}
.is-card:not(.is-pull) .card-bob{animation:bob 2.6s ease-in-out infinite;}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.1vh)}}
.card-face{position:absolute;inset:0;overflow:hidden;border:1px solid rgba(74,144,217,.6);
  container-type:inline-size;
  box-shadow:0 14px 40px rgba(47,93,140,.35),0 2px 6px rgba(47,93,140,.25);}
.card-frame{position:absolute;inset:6px;border:1px solid rgba(74,144,217,.3);pointer-events:none;}

/* All text sizes scale with the card width (cqw), so the proportions match the invitation page on any screen */
.card-text{position:absolute;left:0;right:0;top:0;padding:9cqw 6cqw 0;text-align:center;
  font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-weight:400;color:#23446b;}

/* The block is as wide as the title; the first line is aligned to its left edge */
.card-block{width:fit-content;max-width:100%;margin:0 auto;}
.card-dear{text-align:left;font-style:italic;font-size:3.1cqw;line-height:1.3;color:#4f759f;}
.card-guest{margin-top:1.5cqw;padding-bottom:.1em;text-align:center;overflow-wrap:anywhere;
  font-family:'Pinyon Script','Great Vibes','Allura','Snell Roundhand',cursive;font-weight:400;
  font-size:10cqw;line-height:1.3;
  background:linear-gradient(180deg,#5aa0e6,#2f5d8c);
  -webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;}
.card-rule{width:34%;height:1px;margin:3cqw auto;
  background:linear-gradient(90deg,transparent,rgba(74,144,217,.85),transparent);}
.card-invited{text-align:center;white-space:nowrap;text-transform:uppercase;
  font-size:9cqw;line-height:1.15;letter-spacing:.06em;color:#23446b;}

.card-msg{margin:5cqw auto 0;max-width:92%;text-align:center;
  font-style:italic;font-size:3.1cqw;line-height:1.5;color:#35577f;}
.card-end{white-space:nowrap;}
.card-leaf{display:inline-block;width:1.7em;height:1.7em;margin-left:.45em;vertical-align:-.55em;}

/* ---------- Tap hint under the envelope ---------- */
.px-hint{position:absolute;left:0;right:0;z-index:6;text-align:center;pointer-events:none;
  top:calc(var(--ey) + var(--eh) / 2 + var(--u) * 3);
  font-family:'Pixelify Sans','Courier New',monospace;font-size:clamp(12px,calc(var(--u) * 1.6),18px);
  letter-spacing:.12em;text-transform:uppercase;color:#ffffff;text-shadow:2px 2px 0 #2f5d8c;
  animation:pxBlink 1.6s steps(1,end) infinite;}
@keyframes pxBlink{0%{opacity:1}50%{opacity:.35}100%{opacity:1}}
.is-open .px-hint{animation:none;opacity:0;}

/* ---------- Falling pixel hearts ---------- */
.px-fx{position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden;}
.px-heart{position:absolute;top:-30px;display:block;opacity:.85;animation:pxFall steps(40,end) infinite;}
@keyframes pxFall{
  0%{transform:translate3d(0,-5vh,0)}
  50%{transform:translate3d(calc(var(--dx) * .5),55vh,0)}
  100%{transform:translate3d(var(--dx),110vh,0)}
}

@media (prefers-reduced-motion:reduce){
  .px-cat{animation:none;transform:none;}
  .px-pupils,.px-star,.px-hint{animation:none;}
  .px-heart{animation:none;opacity:0;}
  .is-card:not(.is-pull) .card-bob{animation:none;}
}
`

export default function InvitationIntro({
  guestName,
  envTexts,
  children,
}: {
  guestName: string
  groomName?: string
  brideName?: string
  envTexts?: { tapHint?: string; dear?: string; invited?: string; message?: string }
  children: React.ReactNode
}) {
  const [stage, setStage] = useState<Stage>('closed')
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const reached = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s)

  // An empty tap hint is not shown
  const tapHint = envTexts?.tapHint ?? 'Ketuk untuk membuka'

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  const handleTap = () => {
    // Tap 1: open the envelope
    if (stage === 'closed') {
      // Music must start inside the tap, otherwise the browser blocks it
      const audio = audioRef.current
      if (audio) {
        audio.volume = 0.8
        audio.play().catch(() => {})
      }
      setStage('opening')
      // The card finishes rising at about 2.6s, then it can be pulled out
      timers.current.push(setTimeout(() => setStage('card'), 2700))
      return
    }

    // Tap 2: pull the card out, then crossfade into the invitation page
    if (stage === 'card') {
      setStage('pull')
      timers.current.push(setTimeout(() => setStage('fade'), 1300))
      timers.current.push(setTimeout(() => setStage('done'), 2700))
    }
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const rootClass = [
    'inv-root',
    reached('opening') && 'is-open',
    reached('card') && 'is-card',
    reached('pull') && 'is-pull',
    reached('fade') && 'is-fade',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <style>{css}</style>

      <audio
        ref={audioRef}
        src="/Lullaby.mp3"
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* The page mounts as the intro starts to fade, so the overlay fades straight onto it (no flash) */}
      {reached('fade') && children}

      {stage !== 'done' && (
        <div
          className={rootClass}
          onClick={handleTap}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleTap()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open invitation for ${guestName}`}
        >
          {/* Sky */}
          <div className="px-bg" aria-hidden>
            {STARS.map((s, i) => (
              <span
                key={i}
                className="px-star"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Shadow under the envelope */}
          <div className="px-slide px-shadow" aria-hidden />

          {/* The cat, hiding behind the envelope */}
          <div className="px-slide px-cat-box" aria-hidden>
            <div className="px-cat">
              <Cat />
            </div>
          </div>

          {/* Inside of the envelope */}
          <EnvBack className="px-slide px-svg px-back" />

          {/* The invitation paper, tucked inside */}
          <div className="px-cardclip">
            <Card guestName={guestName} texts={envTexts} />
          </div>

          {/* Front of the envelope: side folds + bottom fold */}
          <EnvFront className="px-slide px-svg px-front" />

          {/* Top flap with the heart seal: the one that opens first */}
          <div className="px-slide px-flap-box" aria-hidden>
            <div className="px-flap">
              <FlapFace className="px-face px-face-front" fill={FLAP} seal />
              <FlapFace className="px-face px-face-back" fill={FLAP_BACK} />
            </div>
          </div>

          {tapHint && (
            <div className="px-hint" aria-hidden>
              {tapHint}
            </div>
          )}

          <div className="px-fx" aria-hidden>
            {HEARTS.map((h, i) => (
              <PixelHeart
                key={i}
                color={h.color}
                scale={h.scale}
                style={
                  {
                    left: `${h.left}%`,
                    animationDuration: `${h.duration}s`,
                    animationDelay: `${h.delay}s`,
                    ['--dx' as string]: `${h.dx}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>
      )}

      {reached('fade') && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={playing ? 'Matikan musik' : 'Putar musik'}
          className="fixed bottom-5 right-5 z-[60] w-11 h-11 rounded-full bg-[#4a90d9] hover:bg-[#2f5d8c] text-white shadow-lg flex items-center justify-center transition"
        >
          {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}
    </>
  )
}