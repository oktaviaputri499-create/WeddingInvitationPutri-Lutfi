'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'opening' | 'card' | 'pull' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'opening', 'card', 'pull', 'fade', 'done']

// Tone-on-tone settings: soft grey outlines, raised charcoal fills
const GOLD = {
  line: '#8c8983',
  lineOpacity: 0.45,
  vineOpacity: 0.4,
  lineWidth: 0.8,
  vein: '#8c8983',
  dots: '#9a968f',
  petalDark: '#121211',
  petalMid: '#1b1a18',
  petalLight: '#262421',
  leaf: '#171615',
  berry: '#1e1c1a',
  stem: '#201f1d',
  center: '#201f1d',
  vineLight: '#252320',
  vineDark: '#121211',
  vineStem: '#252320',
}

const THIN = { vectorEffect: 'non-scaling-stroke' as const }

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 9 + ((i * 7) % 11),
  duration: 8 + ((i * 13) % 7),
  delay: -((i * 29) % 12),
  dx: (i % 2 ? 1 : -1) * (30 + ((i * 11) % 60)),
  color: ['#f3dcdc', '#ead3a6', '#ffffff', '#ebcfcf'][i % 4],
}))

const DUST = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 53) % 100,
  top: (i * 31) % 100,
  size: 2 + ((i * 5) % 4),
  duration: 5 + ((i * 7) % 6),
  delay: -((i * 17) % 10),
}))

// Fine paper grain
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
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
            <path d={LEAF_VEIN} fill="none" strokeOpacity=".3" strokeWidth=".5" {...THIN} />
          </g>
        ))}
        <g transform={`translate(${SPRIG.tip[0]} ${SPRIG.tip[1]}) rotate(${SPRIG.tipAngle}) scale(1.25)`}>
          <path d={LEAF} fill="url(#vineG)" {...THIN} />
          <path d={LEAF_VEIN} fill="none" strokeOpacity=".3" strokeWidth=".5" {...THIN} />
        </g>
        {SPRIG.berries.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="3.6" fill="url(#vineG)" {...THIN} />
        ))}
      </g>
    </svg>
  )
}

type DecorItem = { left: string; top: string; rot: number; k: number }

const DECOR_LAND: DecorItem[] = [
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(var(--sw) * -1.45)', rot: 113, k: 1 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(var(--sw) * -1.45)', rot: 203, k: 1 },
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 23, k: 1 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 293, k: 1 },
  { left: 'calc(var(--sw) * -0.1)', top: 'calc(62% - var(--sw) * 1.45)', rot: 68, k: 0.8 },
  { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(38% - var(--sw) * 1.45)', rot: 248, k: 0.8 },
]

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

// The same vine layer sits on every flap, so the pattern runs
// continuously across the fold lines.
function Decor() {
  return (
    <>
      <DecorLayer items={DECOR_LAND} className="decor decor-land" />
      <DecorLayer items={DECOR_PORT} className="decor decor-port" />
    </>
  )
}

/* ---------- Embossed flower spray (top & bottom flaps) ---------- */

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
const VEINS = ['M0 -10 C1 -26 1 -38 0 -52', 'M-5 -14 C-8 -28 -7 -40 -3 -50', 'M5 -14 C8 -28 7 -40 3 -50']

function Petal({ opacity }: { opacity: string }) {
  return (
    <>
      <path d={PETAL} fill="url(#petalG)" {...THIN} />
      {VEINS.map((v, i) => (
        <path key={i} d={v} fill="none" stroke={GOLD.vein} strokeOpacity={opacity} strokeWidth=".5" {...THIN} />
      ))}
    </>
  )
}

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
            <Petal opacity=".28" />
          </g>
        ))}
        {mid.map(a => (
          <g key={`m${a}`} transform={`rotate(${a}) scale(.72)`}>
            <Petal opacity=".25" />
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
            fillOpacity=".45"
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

// Thin light line along a flap's folded edge (the paper catching the light)
function FlapEdge({ points }: { points: string }) {
  return (
    <svg className="edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,.14)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// The invitation paper that slides out of the envelope
function Card({ guestName }: { guestName: string }) {
  return (
    <div className="card" aria-hidden>
      <div className="card-bob">
        <div className="card-face" style={{ backgroundImage: `${GRAIN}, linear-gradient(180deg,#1e1d1b,#141413)` }}>
          <div className="card-frame" />
          <div className="card-text">
            <div className="card-dear">Dear our beloved guest,</div>
            <div className="card-guest">{guestName}</div>

            <div className="card-rule" />
            <div className="card-invited">You&apos;re Invited</div>
            <div className="card-rule" />

            <div className="card-msg">We would love to celebrate this special day with you</div>

            <svg className="card-leaf" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4.5 19.5 C3.5 10.5 10 4 20 4 C20.5 13.5 14.5 20 4.5 19.5 Z"
                stroke="#c9a96a"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <path d="M4.5 19.5 L15.5 8.5" stroke="#c9a96a" strokeWidth="1" strokeLinecap="round" />
              <path d="M9.5 14.5 L9 10.8 M12 12 L15.2 12.4" stroke="#c9a96a" strokeWidth=".8" strokeLinecap="round" />
            </svg>

            <div className="card-hint">Tarik undangan</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const css = `
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;perspective:1800px;background:#050505;cursor:pointer;
  --sw0:clamp(130px,42vmin,360px);
  --spw:min(96vw,clamp(300px,74vmin,780px));
  -webkit-tap-highlight-color:transparent;
  transition:opacity 1.2s ease,visibility 1.2s;}
.inv-root.is-open{cursor:default;}
.inv-root.is-card{cursor:pointer;}
.inv-root.is-pull{cursor:default;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}
.inv-root:focus-visible{outline:none;}

/* ---------- Inside of the envelope (a darker lining with a very faint pattern) ---------- */
.env-back{position:absolute;inset:0;z-index:1;overflow:hidden;}
.env-back::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(135deg,rgba(184,152,90,.03) 0 1px,transparent 1px 16px);}

/* The front of the envelope: left + right + bottom flaps (this group slides away when the card is pulled out) */
.env-front{position:absolute;inset:0;z-index:3;}

/* ---------- Flaps ---------- */
.flap{position:absolute;inset:0;backface-visibility:hidden;will-change:transform;}
.flap-in{position:absolute;inset:0;overflow:hidden;}
.flap-in::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;}
.edge{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;}
.shade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:4;}

/* Side flaps: two big triangles folded in from the left and right, tips meeting at the center */
.f-left{z-index:1;filter:drop-shadow(5px 0 9px rgba(0,0,0,.6));}
.f-left .flap-in{clip-path:polygon(0 0,50% 54%,0 100%);}
.f-left .flap-in::before{background:linear-gradient(120deg,rgba(255,255,255,.03),rgba(0,0,0,.34));}
.f-right{z-index:1;filter:drop-shadow(-5px 0 9px rgba(0,0,0,.6));}
.f-right .flap-in{clip-path:polygon(100% 0,50% 54%,100% 100%);}
.f-right .flap-in::before{background:linear-gradient(240deg,rgba(255,255,255,.02),rgba(0,0,0,.4));}

/* Bottom flap: tucked over the side flaps, peaked top edge */
.f-bottom{z-index:2;filter:drop-shadow(0 -4px 8px rgba(0,0,0,.65));}
.f-bottom .flap-in{clip-path:polygon(0 100%,100% 100%,100% 72%,50% 54%,0 72%);}
.f-bottom .flap-in::before{background:linear-gradient(0deg,rgba(255,255,255,.02),rgba(0,0,0,.3));}

/* Top flap: big V pointing down, covers everything and opens first */
.f-top{z-index:6;transform-origin:50% 0;filter:drop-shadow(0 10px 14px rgba(0,0,0,.8));}
.f-top .flap-in{clip-path:polygon(0 0,100% 0,100% 30%,50% 56%,0 30%);}
.f-top .flap-in::before{background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(0,0,0,.3));}

/* Raised relief (embossed paper): light on the top-left edge, shadow on the bottom-right */
.decor{position:absolute;inset:0;pointer-events:none;
  filter:drop-shadow(-1px -1px 0 rgba(255,255,255,.1)) drop-shadow(1.6px 2.2px 1.4px rgba(0,0,0,.95));}

.decor-port{display:none;}
@media (max-aspect-ratio:1/1){
  .decor-land{display:none;}
  .decor-port{display:block;}
  .inv-root{--sw0:clamp(140px,50vw,300px);}
}

.decor.rich{
  filter:drop-shadow(-1px -1px 0 rgba(255,255,255,.1)) drop-shadow(1.6px 2.2px 1.4px rgba(0,0,0,.95));
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

/* ---------- 1) Top flap swings open and away (one continuous motion, no fading) ---------- */
.is-open .f-top{animation:openTop 1.7s cubic-bezier(.5,0,.2,1) forwards;}
@keyframes openTop{from{transform:rotateX(0)}to{transform:rotateX(-180deg)}}
.is-open .f-top .shade{animation:shadeIn 1.7s ease-in forwards;}
@keyframes shadeIn{from{opacity:0}to{opacity:.7}}

/* ---------- 2) The invitation paper rises out of the envelope ---------- */
.card{position:absolute;left:50%;top:0;z-index:2;
  width:min(80vw,52vh);height:min(94vh,170vw);
  transform:translate(-50%,86vh) scale(.88);transform-origin:50% 0;will-change:transform;}
.is-open .card{animation:cardRise 1.5s cubic-bezier(.25,.7,.2,1) .9s forwards;}
@keyframes cardRise{
  from{transform:translate(-50%,86vh) scale(.88)}
  to{transform:translate(-50%,3vh) scale(.88)}
}

/* ---------- 3) Guest taps: card is pulled out and grows, the envelope slides away ---------- */
.is-pull .card{animation:cardPull 1.6s cubic-bezier(.55,0,.2,1) forwards;}
@keyframes cardPull{
  from{transform:translate(-50%,3vh) scale(.88)}
  to{transform:translate(-50%,2vh) scale(1)}
}
.is-pull .env-back,.is-pull .env-front{animation:envOut 1.5s cubic-bezier(.65,0,.25,1) forwards;}
@keyframes envOut{from{transform:translateY(0)}to{transform:translateY(104%)}}

/* ---------- Card look: dark paper, thin gold double frame (matches the invitation page) ---------- */
.card-bob{position:absolute;inset:0;}
.is-card:not(.is-pull) .card-bob{animation:bob 2.6s ease-in-out infinite;}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.1vh)}}
.card-face{position:absolute;inset:0;overflow:hidden;border:1px solid rgba(184,152,90,.55);
  container-type:inline-size;
  box-shadow:0 14px 40px rgba(0,0,0,.65),0 2px 6px rgba(0,0,0,.5);}
.card-frame{position:absolute;inset:6px;border:1px solid rgba(184,152,90,.26);pointer-events:none;}

/* All text sizes scale with the card width (cqw), so it fits on phones and desktops alike */
.card-text{position:absolute;left:0;right:0;top:0;padding:8cqw 8cqw 0;text-align:center;
  font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;color:#e9dfc8;}
.card-dear{font-style:italic;font-size:4.4cqw;line-height:1.3;color:rgba(226,214,184,.88);}
.card-guest{margin-top:1cqw;font-size:15cqw;line-height:1.15;color:#d8bd82;
  font-family:'Pinyon Script','Great Vibes','Allura','Snell Roundhand','Brush Script MT',cursive;
  overflow-wrap:anywhere;}
.card-rule{width:46%;height:1px;margin:3.4cqw auto;
  background:linear-gradient(90deg,transparent,rgba(201,169,106,.85),transparent);}
.card-invited{font-size:6.2cqw;line-height:1.2;letter-spacing:.14em;text-transform:uppercase;color:#f1e9d6;white-space:nowrap;}
.card-msg{margin:4.2cqw auto 0;max-width:86%;font-style:italic;font-size:4.2cqw;line-height:1.45;
  color:rgba(226,214,184,.9);text-wrap:balance;}
.card-leaf{display:block;width:7.5cqw;height:7.5cqw;margin:3.6cqw auto 0;}
.card-hint{margin-top:4.5cqw;font-size:2.8cqw;letter-spacing:.22em;text-transform:uppercase;white-space:nowrap;
  color:rgba(214,198,160,.6);animation:hintPulse 3s ease-in-out infinite;}

/* ---------- Tap hint on the closed envelope ---------- */
.tap-hint{position:absolute;left:0;right:0;top:61%;z-index:10;text-align:center;pointer-events:none;
  font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:.3em;text-transform:uppercase;
  color:rgba(200,196,188,.6);animation:hintPulse 3s ease-in-out infinite;}
@keyframes hintPulse{0%,100%{opacity:.4}50%{opacity:.9}}
.is-open .tap-hint{animation:none;opacity:0;transition:opacity .5s ease;}

/* ---------- Petals & dust ---------- */
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
  .tap-hint,.bloom,.card-hint{animation:none;}
  .is-card:not(.is-pull) .card-bob{animation:none;}
  .petal,.dust{animation:none;opacity:0;}
}
`

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
      // The card finishes rising at about 2.4s, then it can be pulled out
      timers.current.push(setTimeout(() => setStage('card'), 2400))
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

  const paper = (gradient: string) => ({ backgroundImage: `${GRAIN}, ${gradient}` })

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
          {/* Inside of the envelope */}
          <div
            className="env-back"
            style={paper('radial-gradient(ellipse at 50% 30%,#0e0e0d 0%,#070707 75%,#040404 100%)')}
          />

          {/* The invitation paper, tucked inside */}
          <Card guestName={guestName} />

          {/* Front of the envelope: side flaps + bottom flap */}
          <div className="env-front">
            <div className="flap f-left">
              <div className="flap-in" style={paper('linear-gradient(90deg,#131312,#0e0e0d)')}>
                <Decor />
                <FlapEdge points="0,0 50,54" />
              </div>
            </div>
            <div className="flap f-right">
              <div className="flap-in" style={paper('linear-gradient(270deg,#141413,#0e0e0d)')}>
                <Decor />
                <FlapEdge points="100,0 50,54" />
              </div>
            </div>
            <div className="flap f-bottom">
              <div className="flap-in" style={paper('linear-gradient(0deg,#10100f,#0c0c0b)')}>
                <Decor />
                <div className="decor rich">
                  <Spray position="bottom" />
                </div>
                <FlapEdge points="0,72 50,54 100,72" />
              </div>
            </div>
          </div>

          {/* Top flap (big V pointing down): the one that opens first */}
          <div className="flap f-top">
            <div className="flap-in" style={paper('linear-gradient(180deg,#181817,#0e0e0d)')}>
              <Decor />
              <div className="decor rich">
                <Spray position="top" />
              </div>
              <FlapEdge points="0,30 50,56 100,30" />
              <div className="shade" />
            </div>
          </div>

          <div className="tap-hint" aria-hidden>
            Ketuk untuk membuka
          </div>

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