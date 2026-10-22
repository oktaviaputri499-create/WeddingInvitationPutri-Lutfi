'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'seal' | 'flap' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'seal', 'flap', 'fade', 'done']

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
  berry: '#1b1a18',
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

// The same vine layer sits on the paper AND on every flap, so the pattern runs
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

// Thin light line along the flap's folded edge (the paper catching the light)
function FlapEdge({ points }: { points: string }) {
  return (
    <svg className="edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const css = `
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;perspective:1800px;background:#050505;cursor:pointer;
  --sw0:clamp(130px,42vmin,360px);
  --spw:min(96vw,clamp(300px,74vmin,780px));
  -webkit-tap-highlight-color:transparent;
  transition:opacity 1.1s ease,visibility 1.1s;}
.inv-root.is-seal{cursor:default;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}
.inv-root:focus-visible{outline:none;}

/* ---------- Envelope paper (the back of the envelope body) ---------- */
.inv-letter{position:absolute;inset:0;z-index:1;overflow:hidden;}

/* ---------- Flaps ---------- */
.flap{position:absolute;inset:0;backface-visibility:hidden;will-change:transform;}
.flap-in{position:absolute;inset:0;overflow:hidden;}
.flap-in::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;}
.edge{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;}

/* Bottom flap: peaked top edge, makes the faint diagonal creases from the sides */
.f-bottom{z-index:3;transform-origin:50% 100%;filter:drop-shadow(0 -3px 6px rgba(0,0,0,.6));}
.f-bottom .flap-in{clip-path:polygon(0 100%,100% 100%,100% 62%,50% 46%,0 62%);}
.f-bottom .flap-in::before{background:linear-gradient(0deg,rgba(255,255,255,.02),rgba(0,0,0,.32));}

/* Top flap: big V pointing down, hinged on the top edge, casts a soft shadow on the paper */
.f-top{z-index:4;transform-origin:50% 0;filter:drop-shadow(0 8px 12px rgba(0,0,0,.8));}
.f-top .flap-in{clip-path:polygon(0 0,100% 0,100% 28%,50% 52%,0 28%);}
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

/* Opening: only the top flap swings up and over, like a real envelope */
.is-flap .f-top{animation:openTop 1.5s cubic-bezier(.55,.05,.3,1) forwards;}
@keyframes openTop{
  0%{transform:rotateX(0);opacity:1}
  80%{opacity:1}
  100%{transform:rotateX(-170deg);opacity:0}
}

/* ---------- Tap hint (sits just under the tip of the top flap) ---------- */
.tap-hint{position:absolute;left:0;right:0;top:58%;z-index:10;text-align:center;pointer-events:none;
  font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:.3em;text-transform:uppercase;
  color:rgba(200,196,188,.6);animation:hintPulse 3s ease-in-out infinite;transition:opacity .4s;}
@keyframes hintPulse{0%,100%{opacity:.35}50%{opacity:.85}}
.is-seal .tap-hint{animation:none;opacity:0;}

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
  .tap-hint,.bloom{animation:none;}
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

    // Timeline: hint fades -> top flap opens -> fade into the page
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

      <audio
        ref={audioRef}
        src="/Lullaby.mp3"
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {reached('fade') && <RevealedContent>{children}</RevealedContent>}

      {stage !== 'done' && (
        <div
          className={rootClass}
          onClick={handleOpen}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleOpen()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open invitation for ${guestName}`}
        >
          {/* Envelope paper: shows between the flaps and is revealed when the top flap opens */}
          <div
            className="inv-letter"
            style={paper('radial-gradient(ellipse at 50% 40%,#121211 0%,#0a0a0a 70%,#060606 100%)')}
          >
            <Decor />
          </div>

          {/* Bottom flap (peaked top edge) */}
          <div className="flap f-bottom">
            <div className="flap-in" style={paper('linear-gradient(0deg,#0f0f0e,#0b0b0a)')}>
              <Decor />
              <div className="decor rich">
                <Spray position="bottom" />
              </div>
              <FlapEdge points="0,62 50,46 100,62" />
            </div>
          </div>

          {/* Top flap (big V pointing down) */}
          <div className="flap f-top">
            <div className="flap-in" style={paper('linear-gradient(180deg,#171716,#0d0d0c)')}>
              <Decor />
              <div className="decor rich">
                <Spray position="top" />
              </div>
              <FlapEdge points="0,28 50,52 100,28" />
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