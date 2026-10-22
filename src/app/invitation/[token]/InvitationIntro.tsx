'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'seal' | 'flap' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'seal', 'flap', 'fade', 'done']

// Thin gold outline settings (used by the flower sprays AND the side vines)
const GOLD = {
  line: '#b8985a', // outline color
  lineOpacity: 0.7, // flower outline strength (lower = more subtle)
  vineOpacity: 0.6, // side vine outline strength
  lineWidth: 0.8, // outline thickness in px (screen space)
  vein: '#b8985a',
  dots: '#c9ad6a',
  // flower fills (charcoal, tuned for the matte black paper)
  petalDark: '#141413',
  petalMid: '#1e1c1a',
  petalLight: '#292724',
  leaf: '#1a1918',
  berry: '#1e1c1a',
  stem: '#232120',
  center: '#232120',
  // side vine fills (embossed look: light top-left -> dark bottom-right)
  vineLight: '#2b2926',
  vineDark: '#121211',
  vineStem: '#2a2825',
}

// Keeps every outline the same thin width on screen, no matter how much the shape is scaled
const THIN = { vectorEffect: 'non-scaling-stroke' as const }

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 9 + ((i * 7) % 11),
  duration: 8 + ((i * 13) % 7),
  delay: -((i * 29) % 12),
  dx: (i % 2 ? 1 : -1) * (30 + ((i * 11) % 60)),
  color: ['#f3dcdc', '#ead3a6', '#ffffff', '#ebcfcf'][i % 4],
}))

// Tiny champagne sparkles drifting upward
const DUST = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 31) % 100,
  size: 2 + ((i * 5) % 4),
  duration: 5 + ((i * 7) % 6),
  delay: -((i * 17) % 10),
}))

// Fine paper grain
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`

// Geometry of one botanical sprig (a curved stem with alternating leaves)
const SPRIG = (() => {
  const P = [
    [20, 290],
    [30, 190],
    [70, 110],
    [130, 20],
  ]
  const at = (t: number) => {
    const u = 1 - t
    return [0, 1].map(
      k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]
    )
  }
  const dir = (t: number) => {
    const u = 1 - t
    return [0, 1].map(
      k => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k])
    )
  }
  const leaves = Array.from({ length: 10 }, (_, i) => {
    const t = 0.1 + i * 0.085
    const [x, y] = at(t)
    const [dx, dy] = dir(t)
    const side = i % 2 === 0 ? 1 : -1
    const a = (Math.atan2(dy, dx) * 180) / Math.PI + side * 52
    const s = 1.3 - t * 0.65
    return { x, y, a, s }
  })
  const berries = [0.28, 0.5, 0.72].map((t, i) => {
    const [x, y] = at(t)
    const [dx, dy] = dir(t)
    const n = Math.atan2(dy, dx) + (i % 2 ? 1 : -1) * (Math.PI / 2)
    return { x: x + Math.cos(n) * 13, y: y + Math.sin(n) * 13 }
  })
  const tip = at(1)
  const tipAngle = (Math.atan2(dir(1)[1], dir(1)[0]) * 180) / Math.PI
  return { leaves, berries, tip, tipAngle }
})()

const LEAF = 'M0 0 C6 -9 20 -9 28 0 C20 9 6 9 0 0 Z'
const LEAF_VEIN = 'M3 0 C10 -0.6 18 -0.6 25 0'
const SPRIG_STEM = 'M20 290 C30 190 70 110 130 20'

// Side vine: embossed charcoal leaves with a thin gold outline.
// overflow:visible stops the SVG from cutting off leaves that extend past its box.
function Sprig({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 300" style={{ overflow: 'visible', ...style }} aria-hidden>
      <defs>
        <linearGradient id="vineG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD.vineLight} />
          <stop offset="1" stopColor={GOLD.vineDark} />
        </linearGradient>
      </defs>
      <g stroke={GOLD.line} strokeOpacity={GOLD.vineOpacity} strokeWidth={GOLD.lineWidth}>
        {/* Stem: thick dark body with a hairline of gold on top */}
        <path
          d={SPRIG_STEM}
          fill="none"
          stroke={GOLD.vineStem}
          strokeOpacity="1"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path d={SPRIG_STEM} fill="none" strokeLinecap="round" {...THIN} />
        {SPRIG.leaves.map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`}>
            <path d={LEAF} fill="url(#vineG)" {...THIN} />
            <path d={LEAF_VEIN} fill="none" strokeOpacity=".25" strokeWidth=".5" {...THIN} />
          </g>
        ))}
        <g transform={`translate(${SPRIG.tip[0]} ${SPRIG.tip[1]}) rotate(${SPRIG.tipAngle}) scale(1.25)`}>
          <path d={LEAF} fill="url(#vineG)" {...THIN} />
          <path d={LEAF_VEIN} fill="none" strokeOpacity=".25" strokeWidth=".5" {...THIN} />
        </g>
        {SPRIG.berries.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="3.6" fill="url(#vineG)" {...THIN} />
        ))}
      </g>
    </svg>
  )
}

type DecorItem = { left: string; top: string; rot: number; k: number }

// Wide screens (laptop / landscape): vines hang from the four corners and the mid edges
const DECOR_LAND: DecorItem[] = [
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(var(--sw) * -1.45)', rot: 113, k: 1 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(var(--sw) * -1.45)', rot: 203, k: 1 },
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 23, k: 1 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 293, k: 1 },
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(62% - var(--sw) * 1.45)', rot: 68, k: 0.8 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(38% - var(--sw) * 1.45)', rot: 248, k: 0.8 },
]

// Tall screens (phone / portrait): vines run along the left and right edges,
// so the middle of the top and bottom flaps stays clear for the flower sprays.
// Each vine's base point is placed with: left = X - 0.1*sw, top = Y - 1.45*sw
const DECOR_PORT: DecorItem[] = [
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 0, k: 1.1 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(var(--sw) * -1.45)', rot: 180, k: 1.1 },
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(48% - var(--sw) * 1.45)', rot: 0, k: 0.85 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(52% - var(--sw) * 1.45)', rot: 180, k: 0.85 },
]

function DecorLayer({ items, className }: { items: DecorItem[]; className: string }) {
  return (
    <div className={className}>
      {items.map((it, i) => (
        <Sprig
          key={i}
          style={
            {
              position: 'absolute',
              ['--sw' as string]: `calc(var(--sw0) * ${it.k})`,
              width: 'var(--sw)',
              height: 'calc(var(--sw) * 1.5)',
              left: it.left,
              top: it.top,
              transformOrigin: '10% 96.7%',
              transform: `rotate(${it.rot}deg)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

// Embossed floral decoration. The same layer is placed inside every flap;
// each flap clips it to its own triangle, so the pattern looks continuous
// when the envelope is closed and each flap carries its own piece when it opens.
// Both layouts are rendered; CSS shows the one that fits the screen shape.
function Decor() {
  return (
    <>
      <DecorLayer items={DECOR_LAND} className="decor decor-land" />
      <DecorLayer items={DECOR_PORT} className="decor decor-port" />
    </>
  )
}

/* ---------- Embossed flower spray with thin gold outline (top & bottom flaps) ---------- */

type Pt = [number, number]

const bez = (P: Pt[], t: number): Pt => {
  const u = 1 - t
  return [0, 1].map(
    k => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]
  ) as Pt
}

const bezDir = (P: Pt[], t: number): Pt => {
  const u = 1 - t
  return [0, 1].map(
    k => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k])
  ) as Pt
}

const stemPath = (P: Pt[]) =>
  `M${P[0][0]} ${P[0][1]} C${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}`

// Two trailing branches (right side; the left side is mirrored)
const BRANCHES: { P: Pt[]; n: number; s: number }[] = [
  {
    P: [
      [0, 0],
      [80, 10],
      [165, 38],
      [252, 26],
    ],
    n: 9,
    s: 1,
  },
  {
    P: [
      [0, 6],
      [55, 42],
      [105, 84],
      [175, 96],
    ],
    n: 7,
    s: 0.85,
  },
]

const SPRAY_LEAVES = BRANCHES.flatMap(({ P, n, s }) =>
  Array.from({ length: n }, (_, i) => {
    const t = 0.2 + (i / (n - 1)) * 0.78
    const [x, y] = bez(P, t)
    const [dx, dy] = bezDir(P, t)
    const side = i % 2 === 0 ? 1 : -1
    const a = (Math.atan2(dy, dx) * 180) / Math.PI + side * 48
    return { x, y, a, s: s * (1.25 - t * 0.55) }
  })
)

const SPRAY_BERRIES = BRANCHES.flatMap(({ P }, bi) =>
  [0.42, 0.66, 0.86].map((t, i) => {
    const [x, y] = bez(P, t)
    const [dx, dy] = bezDir(P, t)
    const n = Math.atan2(dy, dx) + ((i + bi) % 2 ? 1 : -1) * (Math.PI / 2)
    return { x: x + Math.cos(n) * 11, y: y + Math.sin(n) * 11 }
  })
)

const PETAL = 'M0 0 C-17 -10 -21 -38 0 -62 C21 -38 17 -10 0 0 Z'
const BUD = 'M0 0 C-8 -7 -8 -20 0 -30 C8 -20 8 -7 0 0 Z'

function Bloom({
  x,
  y,
  s,
  rot = 0,
  dur = 7,
  delay = 0,
}: {
  x: number
  y: number
  s: number
  rot?: number
  dur?: number
  delay?: number
}) {
  const outer = Array.from({ length: 8 }, (_, i) => i * 45)
  const mid = Array.from({ length: 7 }, (_, i) => i * (360 / 7) + 12)
  const inner = Array.from({ length: 5 }, (_, i) => i * 72 + 20)
  const dots = Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2)
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g className="bloom" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        {outer.map(a => (
          <g key={`o${a}`} transform={`rotate(${a})`}>
            <path d={PETAL} fill="url(#petalG)" {...THIN} />
            <path
              d="M0 -10 C1 -26 1 -38 0 -52"
              fill="none"
              stroke={GOLD.vein}
              strokeOpacity=".22"
              strokeWidth=".5"
              {...THIN}
            />
          </g>
        ))}
        {mid.map(a => (
          <g key={`m${a}`} transform={`rotate(${a}) scale(.72)`}>
            <path d={PETAL} fill="url(#petalG)" {...THIN} />
            <path
              d="M0 -10 C1 -26 1 -38 0 -52"
              fill="none"
              stroke={GOLD.vein}
              strokeOpacity=".2"
              strokeWidth=".5"
              {...THIN}
            />
          </g>
        ))}
        {inner.map(a => (
          <path key={`i${a}`} d={PETAL} transform={`rotate(${a}) scale(.46)`} fill="url(#petalG)" {...THIN} />
        ))}
        <circle r="6" fill={GOLD.center} {...THIN} />
        {dots.map((a, i) => (
          <circle
            key={i}
            cx={Math.cos(a) * 9.5}
            cy={Math.sin(a) * 9.5}
            r="1.2"
            fill={GOLD.dots}
            fillOpacity=".6"
            stroke="none"
          />
        ))}
      </g>
    </g>
  )
}

function Spray({ position }: { position: 'top' | 'bottom' }) {
  return (
    <svg viewBox="-300 -75 600 215" className={`spray spray-${position}`} aria-hidden>
      <defs>
        <linearGradient id="petalG" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={GOLD.petalDark} />
          <stop offset="0.55" stopColor={GOLD.petalMid} />
          <stop offset="1" stopColor={GOLD.petalLight} />
        </linearGradient>
      </defs>
      <g stroke={GOLD.line} strokeOpacity={GOLD.lineOpacity} strokeWidth={GOLD.lineWidth}>
        {[1, -1].map(m => (
          <g key={m} transform={`scale(${m} 1)`}>
            {/* Stems: dark body with a hairline of gold on top */}
            {BRANCHES.map((b, i) => (
              <g key={i} fill="none" strokeLinecap="round">
                <path d={stemPath(b.P)} stroke={GOLD.stem} strokeOpacity="1" strokeWidth="2.6" />
                <path d={stemPath(b.P)} strokeWidth={GOLD.lineWidth} {...THIN} />
              </g>
            ))}
            <g fill={GOLD.leaf}>
              {SPRAY_LEAVES.map((l, i) => (
                <path
                  key={i}
                  d={LEAF}
                  transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`}
                  {...THIN}
                />
              ))}
            </g>
            <g fill={GOLD.berry}>
              {SPRAY_BERRIES.map((b, i) => (
                <circle key={i} cx={b.x} cy={b.y} r="3" {...THIN} />
              ))}
            </g>
            <path d={BUD} transform="translate(68 60) rotate(155)" fill="url(#petalG)" {...THIN} />
            <Bloom x={215} y={38} s={0.42} rot={m * 12} dur={6.2} delay={m * -0.8} />
            <Bloom x={136} y={22} s={0.68} rot={m * 25} dur={7.4} delay={m * -1.6} />
          </g>
        ))}
        <Bloom x={0} y={0} s={1} rot={22} dur={8.5} />
      </g>
    </svg>
  )
}

// Black glossy seal with a champagne-gold rim, a muted antique-gold swan,
// and a soft light reflection on the upper-left.
function Seal() {
  const bumps = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2
    return { x: 50 + Math.cos(a) * 41, y: 50 + Math.sin(a) * 41 }
  })

  // Scalloped outline (drawn several times: shadow, rim, body)
  const outline = (
    <>
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="9.5" />
      ))}
      <circle cx="50" cy="50" r="42" />
    </>
  )

  // Swan silhouette facing right: S-curved neck, head with beak, rounded body, lifted tail
  const swan = (
    <>
      {/* Body + neck + head */}
      <path
        d="M24 49.5
           C30 66 52 70 64 60
           C68 56 66.5 50 62 45
           C59 41.5 59.5 36 61 32.5
           C62 29.5 60.5 26.5 57.8 27
           C55 27.4 54.6 30.5 55.2 33.5
           C56 38 57.5 42 57.5 46
           C57.5 49 53 49 49 47.5
           C42 45 32 44 24 49.5 Z"
        stroke="none"
      />
      {/* Beak */}
      <path d="M60.5 27.8 L67 30.4 L60.2 31.6 Z" stroke="none" />
      {/* Water ripple */}
      <path d="M30 71 C40 73.5 56 73.5 66 70" fill="none" strokeWidth="1.1" strokeLinecap="round" />
    </>
  )

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
      <defs>
        {/* Glossy black body, lit from the top-left (about 12% brighter than before) */}
        <radialGradient id="sealBody" gradientUnits="userSpaceOnUse" cx="34" cy="26" r="88">
          <stop offset="0" stopColor="#5a554e" />
          <stop offset="0.38" stopColor="#33302d" />
          <stop offset="0.72" stopColor="#181716" />
          <stop offset="1" stopColor="#0a0a09" />
        </radialGradient>
        {/* Champagne-gold rim: bright top-left, dimmer bottom-right */}
        <linearGradient id="sealRim" gradientUnits="userSpaceOnUse" x1="14" y1="12" x2="86" y2="88">
          <stop offset="0" stopColor="#f0dcab" />
          <stop offset="0.45" stopColor="#c9b27c" />
          <stop offset="1" stopColor="#7d6a42" />
        </linearGradient>
        {/* Pressed-in center */}
        <linearGradient id="sealDish" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#11100f" />
          <stop offset="1" stopColor="#35322d" />
        </linearGradient>
        {/* Soft reflection, upper-left */}
        <radialGradient id="sealSpec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.4" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* Swan: muted antique gold, lit from the top-left */}
        <linearGradient id="swanG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d2b87a" />
          <stop offset="0.55" stopColor="#b0945a" />
          <stop offset="1" stopColor="#7d6638" />
        </linearGradient>
      </defs>

      {/* Edge: cast shadow, champagne rim, then the black body on top.
          The rim stroke sits under the body, so only its outer half shows
          as a thin gold line around the scalloped edge. */}
      <g fill="#000" fillOpacity=".55" transform="translate(1.2 1.6)">
        {outline}
      </g>
      <g fill="url(#sealRim)" stroke="url(#sealRim)" strokeWidth="1.5">
        {outline}
      </g>
      <g fill="url(#sealBody)">{outline}</g>

      {/* Pressed-in center disc with an inner ring */}
      <circle cx="50" cy="50" r="34" fill="url(#sealDish)" />
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="rgba(0,0,0,0.7)"
        strokeWidth="1.2"
        transform="translate(-0.5 -0.5)"
      />
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="rgba(236,214,160,0.5)"
        strokeWidth="1"
        transform="translate(0.6 0.6)"
      />

      {/* Upper-left reflection: soft glow plus a thin arc of light along the edge */}
      <ellipse cx="34" cy="27" rx="21" ry="10.5" fill="url(#sealSpec)" transform="rotate(-35 34 27)" />
      <path
        d="M15.2 37.3 A37 37 0 0 1 43.6 13.6"
        fill="none"
        stroke="rgba(255,244,214,0.4)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Raised swan, centered inside the ring */}
      <g transform="translate(50 50) scale(1.05) translate(-46 -47)">
        {/* Cast shadow (bottom-right) */}
        <g transform="translate(1.1 1.4)" fill="rgba(0,0,0,0.75)" stroke="rgba(0,0,0,0.75)">
          {swan}
        </g>
        {/* Light edge (top-left) */}
        <g transform="translate(-0.5 -0.5)" fill="rgba(244,226,176,0.75)" stroke="rgba(244,226,176,0.75)">
          {swan}
        </g>
        {/* Swan body: antique gold */}
        <g fill="url(#swanG)" stroke="rgba(236,214,160,0.55)">
          {swan}
        </g>
        {/* Wing feather lines: darker than the gold so the detail reads */}
        <g fill="none" stroke="rgba(52,38,16,0.5)" strokeWidth="0.9" strokeLinecap="round">
          <path d="M33 54 C40 49 50 49 57 55" />
          <path d="M36 58.5 C42 54.5 50 54.5 56 59.5" />
        </g>
      </g>
    </svg>
  )
}

const css = `
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;perspective:1600px;background:#050505;
  --seal:clamp(104px,24vmin,170px);--sw0:clamp(130px,42vmin,360px);
  --spw:min(96vw,clamp(300px,74vmin,780px));
  transition:opacity 1.1s ease,visibility 1.1s;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}

/* ---------- Paper revealed when the flaps open ---------- */
.inv-letter{position:absolute;inset:0;z-index:1;}

/* ---------- Flaps ---------- */
.flap{position:absolute;inset:0;backface-visibility:hidden;will-change:transform;
  filter:drop-shadow(0 4px 10px rgba(0,0,0,.8));}
.flap-in{position:absolute;inset:0;overflow:hidden;}
.flap-in::before{content:'';position:absolute;inset:0;pointer-events:none;}
.f-top{z-index:4;transform-origin:50% 0;}
.f-top .flap-in{clip-path:polygon(0 0,100% 0,50% 50.15%);}
.f-top .flap-in::before{background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.45));}
.f-bottom{z-index:3;transform-origin:50% 100%;}
.f-bottom .flap-in{clip-path:polygon(0 100%,100% 100%,50% 49.85%);}
.f-bottom .flap-in::before{background:linear-gradient(0deg,rgba(255,255,255,.03),rgba(0,0,0,.42));}
.f-left{z-index:5;transform-origin:0 50%;}
.f-left .flap-in{clip-path:polygon(0 0,50.1% 50%,0 100%);}
.f-left .flap-in::before{background:linear-gradient(90deg,rgba(255,255,255,.02),rgba(0,0,0,.48));}
.f-right{z-index:5;transform-origin:100% 50%;}
.f-right .flap-in{clip-path:polygon(100% 0,49.9% 50%,100% 100%);}
.f-right .flap-in::before{background:linear-gradient(270deg,rgba(255,255,255,.02),rgba(0,0,0,.42));}

/* Raised relief for the side vines: highlight on the top-left edge, deep cast shadow bottom-right */
.decor{position:absolute;inset:0;pointer-events:none;
  filter:drop-shadow(-1px -1px .5px rgba(255,255,255,.14)) drop-shadow(1.6px 2.2px 1.6px rgba(0,0,0,.9));}

/* Two vine layouts: wide screens use .decor-land, tall (phone) screens use .decor-port */
.decor-port{display:none;}
@media (max-aspect-ratio:1/1){
  .decor-land{display:none;}
  .decor-port{display:block;}
  .inv-root{--sw0:clamp(140px,50vw,300px);}
}

/* Flower spray: deeper emboss than the vines, fades in on load */
.decor.rich{
  filter:drop-shadow(-1px -1px .5px rgba(255,255,255,.13)) drop-shadow(1.6px 2.2px 1.6px rgba(0,0,0,.9));
  animation:florIn 2s ease-out .2s both;}
@keyframes florIn{0%{opacity:0}100%{opacity:1}}
.spray{position:absolute;left:50%;width:var(--spw);height:auto;overflow:visible;}
.spray-top{top:calc(var(--spw) * -.025);transform:translateX(-50%);}
.spray-bottom{bottom:calc(var(--spw) * -.025);transform:translateX(-50%) rotate(180deg);}
.bloom{transform-box:fill-box;transform-origin:center;animation:bloomSway 7s ease-in-out infinite;}
@keyframes bloomSway{
  0%,100%{transform:rotate(-3deg) scale(1)}
  50%{transform:rotate(3deg) scale(1.035)}
}

.is-flap .f-top{animation:openTop 1.5s cubic-bezier(.6,.05,.3,1) forwards;}
.is-flap .f-bottom{animation:openBottom 1.5s cubic-bezier(.6,.05,.3,1) .12s forwards;}
.is-flap .f-left{animation:openLeft 1.5s cubic-bezier(.6,.05,.3,1) .24s forwards;}
.is-flap .f-right{animation:openRight 1.5s cubic-bezier(.6,.05,.3,1) .24s forwards;}
@keyframes openTop{0%{transform:rotateX(0);opacity:1}75%{opacity:1}100%{transform:rotateX(-105deg);opacity:0}}
@keyframes openBottom{0%{transform:rotateX(0);opacity:1}75%{opacity:1}100%{transform:rotateX(105deg);opacity:0}}
@keyframes openLeft{0%{transform:rotateY(0);opacity:1}75%{opacity:1}100%{transform:rotateY(105deg);opacity:0}}
@keyframes openRight{0%{transform:rotateY(0);opacity:1}75%{opacity:1}100%{transform:rotateY(-105deg);opacity:0}}

/* ---------- Seal glow (soft halo behind the seal, helps it stand out on black) ---------- */
.seal-glow{position:absolute;left:50%;top:50%;z-index:9;pointer-events:none;border-radius:50%;
  width:calc(var(--seal) * 2.4);height:calc(var(--seal) * 2.4);
  margin:calc(var(--seal) * -1.2) 0 0 calc(var(--seal) * -1.2);
  background:radial-gradient(circle,rgba(210,185,125,.28) 0%,rgba(210,185,125,.09) 40%,rgba(210,185,125,0) 70%);
  animation:glowBreath 3.4s ease-in-out infinite;}
@keyframes glowBreath{0%,100%{opacity:.55;transform:scale(.92)}50%{opacity:1;transform:scale(1.06)}}
.is-seal .seal-glow{animation:glowOut .9s ease-out forwards;}
@keyframes glowOut{0%{opacity:1;transform:scale(1.06)}40%{opacity:1;transform:scale(1.5)}100%{opacity:0;transform:scale(2.3)}}

/* ---------- Wax seal (also the tap target) ---------- */
.seal{position:absolute;left:50%;top:50%;z-index:10;width:var(--seal);height:var(--seal);
  margin:calc(var(--seal) / -2) 0 0 calc(var(--seal) / -2);padding:0;border:0;background:none;cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  filter:drop-shadow(0 0 8px rgba(210,185,125,.28)) drop-shadow(0 6px 10px rgba(0,0,0,.85)) drop-shadow(0 1px 1px rgba(0,0,0,.6)) brightness(1.06);}
.seal.broken{cursor:default;}
.seal:focus-visible{outline:2px solid #8a7a58;outline-offset:8px;border-radius:50%;}
.seal:not(.broken){animation:sealPulse 2.6s ease-in-out infinite;}
.seal:not(.broken):hover{filter:drop-shadow(0 0 10px rgba(210,185,125,.38)) drop-shadow(0 6px 10px rgba(0,0,0,.85)) brightness(1.16);}
@keyframes sealPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.is-seal .seal{animation:sealFade .6s ease-out forwards;pointer-events:none;}
@keyframes sealFade{0%{transform:scale(1);opacity:1}100%{transform:scale(.94);opacity:0}}

/* Light streak sweeping across the seal like a glossy reflection */
.seal-shine{position:absolute;inset:3%;border-radius:50%;overflow:hidden;pointer-events:none;}
.seal-shine::after{content:'';position:absolute;top:-20%;bottom:-20%;left:-60%;width:40%;
  background:linear-gradient(100deg,rgba(255,240,200,0),rgba(255,240,200,.26),rgba(255,240,200,0));
  transform:skewX(-18deg);animation:sealShine 4.4s ease-in-out infinite;}
@keyframes sealShine{0%,55%{left:-60%}100%{left:130%}}

/* ---------- Petals & gold dust ---------- */
.petals{position:absolute;inset:0;pointer-events:none;z-index:11;overflow:hidden;}
.petal{position:absolute;top:-30px;border-radius:150% 0 150% 0;opacity:.7;animation:petalFall linear infinite;
  box-shadow:0 2px 6px rgba(120,80,60,.15);}
@keyframes petalFall{
  0%{transform:translate3d(0,-5vh,0) rotate(0deg)}
  50%{transform:translate3d(calc(var(--dx) * .5),55vh,0) rotate(180deg)}
  100%{transform:translate3d(var(--dx),110vh,0) rotate(360deg)}
}
.dust{position:absolute;border-radius:50%;opacity:0;
  background:radial-gradient(circle,rgba(240,222,170,.95),rgba(240,222,170,0) 70%);
  animation:dustFloat ease-in-out infinite;}
@keyframes dustFloat{
  0%{transform:translate3d(0,12px,0) scale(.6);opacity:0}
  30%{opacity:.9}
  70%{opacity:.5}
  100%{transform:translate3d(10px,-40px,0) scale(1.1);opacity:0}
}

@media (prefers-reduced-motion:reduce){
  .seal:not(.broken){animation:none;}
  .seal-glow,.bloom,.seal-shine::after{animation:none;}
  .petal,.dust{animation:none;opacity:0;}
}
`

function RevealedContent({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={`transition-opacity duration-[1200ms] ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  )
}

export default function InvitationIntro({
  guestName,
  children,
}: {
  guestName: string
  groomName?: string
  brideName?: string
  children: React.ReactNode
}) {
  const [stage, setStage] = useState<Stage>('closed')
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const reached = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s)

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  const handleOpen = () => {
    if (stage !== 'closed') return

    // Music must start inside the tap, otherwise the browser blocks it
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.8
      audio.play().catch(() => {})
    }

    // Timeline: seal fades -> flaps open -> fade into the page
    setStage('seal')
    timers.current.push(setTimeout(() => setStage('flap'), 300))
    timers.current.push(setTimeout(() => setStage('fade'), 2500))
    timers.current.push(setTimeout(() => setStage('done'), 3700))
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
    reached('seal') && 'is-seal',
    reached('flap') && 'is-flap',
    reached('fade') && 'is-fade',
  ]
    .filter(Boolean)
    .join(' ')

  const paper = (gradient: string) => ({ backgroundImage: `${GRAIN}, ${gradient}` })

  return (
    <>
      <style>{css}</style>

      {/* Stays mounted the whole time so the song keeps playing after the intro */}
      <audio
        ref={audioRef}
        src="/Lullaby.mp3"
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* The page content mounts as the intro starts to fade, so it fades in smoothly */}
      {reached('fade') && <RevealedContent>{children}</RevealedContent>}

      {stage !== 'done' && (
        <div className={rootClass}>
          {/* Matte black paper, hidden behind the flaps until they open */}
          <div
            className="inv-letter"
            style={paper('radial-gradient(ellipse at 50% 40%,#131312 0%,#0a0a0a 70%,#050505 100%)')}
          />

          {/* Four flaps meeting in an X: matte black paper, soft fold shading, embossed ornaments */}
          <div className="flap f-bottom">
            <div className="flap-in" style={paper('linear-gradient(0deg,#0e0e0d,#080808)')}>
              <Decor />
              <div className="decor rich">
                <Spray position="bottom" />
              </div>
            </div>
          </div>
          <div className="flap f-top">
            <div className="flap-in" style={paper('linear-gradient(180deg,#151514,#090909)')}>
              <Decor />
              <div className="decor rich">
                <Spray position="top" />
              </div>
            </div>
          </div>
          <div className="flap f-left">
            <div className="flap-in" style={paper('linear-gradient(90deg,#10100f,#090909)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-right">
            <div className="flap-in" style={paper('linear-gradient(270deg,#111110,#090909)')}>
              <Decor />
            </div>
          </div>

          {/* Soft halo behind the seal */}
          <div className="seal-glow" aria-hidden />

          {/* Wax seal: tap it to open */}
          <button
            type="button"
            className={`seal ${reached('seal') ? 'broken' : ''}`}
            onClick={handleOpen}
            aria-label={`Open invitation for ${guestName}`}
          >
            <Seal />
            <span className="seal-shine" aria-hidden />
          </button>

          {/* Floating petals + gold dust */}
          <div className="petals">
            {PETALS.map((p, i) => (
              <span
                key={i}
                className="petal"
                style={
                  {
                    left: `${p.left}%`,
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                    ['--dx' as string]: `${p.dx}px`,
                  } as React.CSSProperties
                }
              />
            ))}
            {DUST.map((d, i) => (
              <span
                key={`d${i}`}
                className="dust"
                style={{
                  left: `${d.left}%`,
                  top: `${d.top}%`,
                  width: d.size,
                  height: d.size,
                  animationDuration: `${d.duration}s`,
                  animationDelay: `${d.delay}s`,
                }}
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
          className="fixed bottom-5 right-5 z-[60] w-11 h-11 rounded-full bg-dark-brown/90 text-white shadow-lg flex items-center justify-center hover:bg-gold transition"
        >
          {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}
    </>
  )
}