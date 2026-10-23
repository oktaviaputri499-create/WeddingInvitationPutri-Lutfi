'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'opening' | 'card' | 'loading' | 'pull' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'opening', 'card', 'loading', 'pull', 'fade', 'done']

// How long the loading bar takes (ms). Keep it equal to the 3.4s in the CSS (.ld-cat, .ld-fill).
const LOAD_MS = 3400

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

/* ---------- The pixel cat that peeks from behind the envelope (22 x 14 pixels) ---------- */

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

/* ---------- The small side-view cat that hops along the loading bar (16 x 11 pixels) ---------- */
// O = outline, G = gray, L = light belly and muzzle, P = pink ear, N = eye
const SIDECAT = [
  '..........O...O.',
  '..........OPGPO.',
  '..........OGGNO.',
  '.O........OGGLLO',
  '.OO..OOOOOOGGGO.',
  '.OOGGGGGGGGGGO..',
  '..OGGGGGGGGGGO..',
  '..OGGLLLLLLGGO..',
  '..OOOOOOOOOOOO..',
  '...GG......GG...',
  '...OO......OO...',
]
const SIDECAT_COLORS: Record<string, string> = {
  O: '#2f4a73',
  G: '#b7b7c4',
  L: '#e6e6ee',
  P: '#f4a3b8',
  N: '#1f2a44',
}
const SIDECAT_RECTS = patternRects(SIDECAT, ch => ch in SIDECAT_COLORS)

function SideCat() {
  return (
    <svg viewBox="0 0 16 11" width="100%" shapeRendering="crispEdges" style={{ display: 'block' }} aria-hidden>
      {SIDECAT_RECTS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={SIDECAT_COLORS[r.ch]} />
      ))}
    </svg>
  )
}

/* ---------- Small pixel arrow on the "Click to Open" button ---------- */

const ARROW = ['X....', 'XX...', 'XXX..', 'XXXX.', 'XXX..', 'XX...', 'X....']
const ARROW_RECTS = patternRects(ARROW, ch => ch === 'X')

function OpenArrow() {
  return (
    <svg className="open-arrow" viewBox="0 0 5 7" shapeRendering="crispEdges" aria-hidden>
      {ARROW_RECTS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill="#ffffff" />
      ))}
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

/* ---------- Pixel ornament at the bottom of the invitation card ---------- */
// X = pink, h = light pink, B = blue, w = ice white, S = sparkle, g = pale blue
const ORN_COLORS: Record<string, string> = {
  X: '#f59ab9',
  h: '#ffd3e2',
  B: '#4a90d9',
  w: '#e6f3ff',
  S: '#7fb2e5',
  g: '#9cc3ea',
}
const ORN_H = 6

const ORN_HEART = ['.hX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']
const ORN_DIAMOND = ['..B..', '.BBB.', 'BBwBB', '.BBB.', '..B..']
const ORN_SPARKLE = ['.S.', 'SSS', '.S.']

// Pads a piece to the full ornament height (top = how many blank rows go above it)
const ornPad = (rows: string[], top: number) =>
  Array.from({ length: ORN_H }, (_, y) => rows[y - top] ?? '.'.repeat(rows[0].length))
const ornGap = (w: number) => Array.from({ length: ORN_H }, () => '.'.repeat(w))
const ornDash = (s: string) =>
  Array.from({ length: ORN_H }, (_, r) => (r === 2 ? s : '.'.repeat(s.length)))

const ORN_DASH_L = 'g.g.B.B.B.'
const ORN_DASH_R = reverseStr(ORN_DASH_L)

const ORN_PIECES = [
  ornDash(ORN_DASH_L),
  ornGap(2),
  ornPad(ORN_HEART, 0),
  ornGap(2),
  ornPad(ORN_SPARKLE, 1),
  ornGap(2),
  ornPad(ORN_DIAMOND, 0),
  ornGap(2),
  ornPad(ORN_SPARKLE, 1),
  ornGap(2),
  ornPad(ORN_HEART, 0),
  ornGap(2),
  ornDash(ORN_DASH_R),
]

const ORN_ROWS = Array.from({ length: ORN_H }, (_, r) => ORN_PIECES.map(p => p[r]).join(''))
const ORN_COLS = ORN_ROWS[0].length
const ORN_RECTS = patternRects(ORN_ROWS, ch => ch in ORN_COLORS)

function CardOrnament() {
  return (
    <svg viewBox={`0 0 ${ORN_COLS} ${ORN_H}`} width="100%" shapeRendering="crispEdges" style={{ display: 'block' }}>
      {ORN_RECTS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={ORN_COLORS[r.ch]} />
      ))}
    </svg>
  )
}

/* ---------- The invitation paper that slides out of the envelope ---------- */
// A text that is empty is not shown (the guest name always is).
function Card({
  guestName,
  texts,
  loading,
  canOpen,
  onOpen,
}: {
  guestName: string
  texts?: { dear?: string; invited?: string; message?: string; openButton?: string; loading?: string }
  loading: boolean
  canOpen: boolean
  onOpen: () => void
}) {
  const dear = texts?.dear ?? 'Dear our beloved guest,'
  const invited = texts?.invited ?? "You're Invited"
  const message = texts?.message ?? 'We would love to celebrate this special day with you'
  const openText = texts?.openButton ?? 'Click to Open'
  const loadingText = texts?.loading ?? 'Loading'

  // The pixel heart sits right after the last two words
  const words = message.trim().split(/\s+/).filter(Boolean)
  const tail = words.slice(-2).join(' ')
  const head = words.slice(0, -2).join(' ')

  return (
    <div className="card">
      <div className="card-bob">
        <div className="card-face">
          <div className="card-paper">
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
                    <svg className="card-leaf" viewBox="0 0 6 5" shapeRendering="crispEdges" aria-hidden>
                      {HEART_RECTS.map((r, i) => (
                        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill="#f59ab9" />
                      ))}
                    </svg>
                  </span>
                </div>
              )}

              {/* The "Click to Open" button, which turns into the loading bar with the hopping cat */}
              <div className="card-action">
                {loading ? (
                  <div className="ld" role="status" aria-live="polite">
                    <div className="ld-text">
                      {loadingText}
                      <span className="ld-dot">.</span>
                      <span className="ld-dot">.</span>
                      <span className="ld-dot">.</span>
                    </div>
                    <div className="ld-lane">
                      <div className="ld-cat">
                        <div className="ld-cat-in">
                          <SideCat />
                        </div>
                      </div>
                    </div>
                    <div className="ld-bar">
                      <div className="ld-fill" />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="open-btn"
                    disabled={!canOpen}
                    onClick={e => {
                      e.stopPropagation()
                      onOpen()
                    }}
                  >
                    <OpenArrow />
                    <span>{openText}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="card-orn">
              <CardOrnament />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');

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
.inv-root.is-card{cursor:default;}
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
/* The envelope layers never catch clicks, so the button on the card stays clickable */
.px-svg,.px-shadow,.px-cat-box,.px-flap-box{pointer-events:none;}

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

/* ---------- Guest finished loading: card grows, the envelope slides away ---------- */
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

/* ---------- Pixel paper card: stepped outline, hard pixel shadow, dithered paper ---------- */
.card-bob{position:absolute;inset:0;filter:drop-shadow(6px 6px 0 rgba(47,93,140,.32));}
.is-card:not(.is-pull):not(.is-loading) .card-bob{animation:bob 2.6s ease-in-out infinite;}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.1vh)}}

/* Outer layer = the dark outline, cut with notched pixel corners */
.card-face{position:absolute;inset:0;background:#2f5d8c;container-type:inline-size;
  clip-path:polygon(
    0 8px,4px 8px,4px 4px,8px 4px,8px 0,
    calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,
    100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,
    8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px));}

/* Inner layer = the paper, with a light checker dither */
.card-paper{position:absolute;inset:4px;overflow:hidden;
  background:
    conic-gradient(rgba(74,144,217,.07) 25%,transparent 0 50%,rgba(74,144,217,.07) 0 75%,transparent 0) 0 0 / 8px 8px,
    linear-gradient(180deg,#ffffff,#e3f0fc);
  image-rendering:pixelated;
  clip-path:polygon(
    4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,
    100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,
    4px 100%,4px calc(100% - 4px),0 calc(100% - 4px),0 4px,4px 4px);}

/* Dashed pixel frame inside the paper */
.card-frame{position:absolute;inset:8px;border:2px dashed rgba(74,144,217,.5);pointer-events:none;}

/* All text sizes scale with the card width (cqw), so the proportions stay the same on any screen */
.card-text{position:absolute;left:0;right:0;top:0;padding:9cqw 6cqw 0;text-align:center;
  font-family:'Pixelify Sans','Courier New',monospace;font-weight:400;color:#23446b;
  -webkit-font-smoothing:none;}

/* The block is as wide as the title; the first line is aligned to its left edge */
.card-block{width:fit-content;max-width:100%;margin:0 auto;}
.card-dear{text-align:left;font-size:3.3cqw;line-height:1.3;color:#4f759f;letter-spacing:.02em;}
.card-guest{margin-top:2cqw;text-align:center;overflow-wrap:anywhere;
  font-weight:600;font-size:8.5cqw;line-height:1.25;letter-spacing:.02em;color:#2f5d8c;
  text-shadow:.6cqw .6cqw 0 rgba(74,144,217,.32);}
.card-rule{width:42%;height:.9cqw;margin:3.2cqw auto;
  background:repeating-linear-gradient(90deg,#4a90d9 0 1.2cqw,transparent 1.2cqw 2.4cqw);}
.card-invited{text-align:center;white-space:nowrap;text-transform:uppercase;font-weight:600;
  font-size:7.6cqw;line-height:1.2;letter-spacing:.05em;color:#23446b;
  text-shadow:.6cqw .6cqw 0 rgba(74,144,217,.3);}

.card-msg{margin:5cqw auto 0;max-width:92%;text-align:center;
  font-size:3.4cqw;line-height:1.5;color:#35577f;}
.card-end{white-space:nowrap;}
.card-leaf{display:inline-block;width:1.5em;height:1.25em;margin-left:.5em;vertical-align:-.15em;}

/* Pixel ornament near the bottom of the card */
.card-orn{position:absolute;left:50%;bottom:10cqw;width:60cqw;transform:translateX(-50%);}

/* ---------- "Click to Open" button and loading bar (the red area on the card) ---------- */
.card-action{margin:12cqw auto 0;width:60cqw;pointer-events:auto;}

.open-btn{display:flex;align-items:center;justify-content:center;gap:2.6cqw;width:100%;
  font-family:'Pixelify Sans','Courier New',monospace;font-weight:600;font-size:4.6cqw;line-height:1;
  letter-spacing:.06em;text-transform:uppercase;color:#ffffff;
  background:#4a90d9;border:.9cqw solid #2f5d8c;padding:3.4cqw 2cqw;cursor:pointer;
  box-shadow:1.2cqw 1.2cqw 0 rgba(47,93,140,.35),inset 0 .9cqw 0 rgba(255,255,255,.35);
  text-shadow:.5cqw .5cqw 0 rgba(35,68,107,.55);
  animation:openPulse 1.2s steps(1,end) infinite;}
.open-btn:hover:not(:disabled){background:#5aa0e6;}
.open-btn:active:not(:disabled){transform:translate(.9cqw,.9cqw);
  box-shadow:.3cqw .3cqw 0 rgba(47,93,140,.35),inset 0 .9cqw 0 rgba(255,255,255,.35);}
.open-btn:disabled{opacity:.55;cursor:default;animation:none;}
.open-btn:focus-visible{outline:.9cqw dashed #23446b;outline-offset:1cqw;}
.open-arrow{width:2.6cqw;height:3.64cqw;flex:none;}
@keyframes openPulse{0%{transform:translateY(0)}50%{transform:translateY(-.8cqw)}100%{transform:translateY(0)}}

.ld{width:100%;text-align:center;font-family:'Pixelify Sans','Courier New',monospace;color:#4a6fb5;}
.ld-text{font-weight:600;font-size:6.4cqw;line-height:1;letter-spacing:.04em;
  text-shadow:.5cqw .5cqw 0 rgba(74,144,217,.28);}
.ld-dot{animation:ldDot 1.2s steps(1,end) infinite;}
.ld-dot:nth-child(2){animation-delay:.2s;}
.ld-dot:nth-child(3){animation-delay:.4s;}
@keyframes ldDot{0%{opacity:.15}50%{opacity:1}100%{opacity:1}}

/* The lane above the bar: the cat runs along it in steps and hops all the way */
.ld-lane{position:relative;height:13cqw;margin-top:1cqw;}
.ld-cat{position:absolute;left:0;bottom:0;width:10cqw;animation:ldRun 3.4s steps(14,end) forwards;}
.ld-cat-in{animation:ldHop .5s steps(1,end) infinite;}
@keyframes ldRun{from{left:0}to{left:calc(100% - 10cqw)}}
@keyframes ldHop{
  0%{transform:translateY(0)}
  25%{transform:translateY(-3cqw)}
  50%{transform:translateY(-5cqw)}
  75%{transform:translateY(-3cqw)}
  100%{transform:translateY(0)}
}

.ld-bar{height:8cqw;border:1.2cqw solid #4a6fb5;background:#ffffff;padding:.8cqw;
  box-shadow:.9cqw .9cqw 0 rgba(47,93,140,.25);}
.ld-fill{height:100%;width:0;
  background:repeating-linear-gradient(90deg,#4a90d9 0 2.4cqw,#7fb2e5 2.4cqw 3cqw);
  animation:ldFill 3.4s steps(14,end) forwards;}
@keyframes ldFill{to{width:100%}}

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
  .open-btn,.ld-dot,.ld-cat-in{animation:none;}
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
  envTexts?: {
    tapHint?: string
    dear?: string
    invited?: string
    message?: string
    openButton?: string
    loading?: string
  }
  children: React.ReactNode
}) {
  const [stage, setStage] = useState<Stage>('closed')
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const startedRef = useRef(false)

  const reached = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s)

  // An empty tap hint is not shown
  const tapHint = envTexts?.tapHint ?? 'Ketuk untuk membuka'

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  // Tap the envelope: open it
  const handleTap = () => {
    if (stage !== 'closed') return

    // Music must start inside the tap, otherwise the browser blocks it
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.8
      audio.play().catch(() => {})
    }
    setStage('opening')
    // The card finishes rising at about 2.6s, then the button can be pressed
    timers.current.push(setTimeout(() => setStage('card'), 2700))
  }

  // Press "Click to Open": the loading bar runs, then the card is pulled out and fades into the page
  const startLoading = () => {
    if (stage !== 'card' || startedRef.current) return
    startedRef.current = true
    setStage('loading')

    timers.current.push(
      setTimeout(() => {
        setStage('pull')
        timers.current.push(setTimeout(() => setStage('fade'), 1300))
        timers.current.push(setTimeout(() => setStage('done'), 2700))
      }, LOAD_MS + 400)
    )
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
    stage === 'loading' && 'is-loading',
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
            if (stage === 'closed' && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleTap()
            }
          }}
          role={stage === 'closed' ? 'button' : undefined}
          tabIndex={stage === 'closed' ? 0 : -1}
          aria-label={stage === 'closed' ? `Open invitation for ${guestName}` : undefined}
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
            <Card
              guestName={guestName}
              texts={envTexts}
              loading={reached('loading')}
              canOpen={stage === 'card'}
              onOpen={startLoading}
            />
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