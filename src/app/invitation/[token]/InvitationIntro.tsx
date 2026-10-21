'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'seal' | 'flap' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'seal', 'flap', 'fade', 'done']

const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 9 + ((i * 7) % 11),
  duration: 8 + ((i * 13) % 7),
  delay: -((i * 29) % 12),
  dx: (i % 2 ? 1 : -1) * (30 + ((i * 11) % 60)),
  color: ['#f3dcdc', '#ead3a6', '#ffffff', '#ebcfcf'][i % 4],
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

// The original sprig, in tone-on-tone charcoal so it shows as a soft relief on the black paper
function Sprig({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 300" style={style} aria-hidden>
      <g fill="#262422" stroke="#3b3834" strokeWidth="0.8">
        <path d="M20 290 C30 190 70 110 130 20" fill="none" strokeWidth="2.4" strokeLinecap="round" />
        {SPRIG.leaves.map((l, i) => (
          <path key={i} d={LEAF} transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`} />
        ))}
        <path
          d={LEAF}
          transform={`translate(${SPRIG.tip[0]} ${SPRIG.tip[1]}) rotate(${SPRIG.tipAngle}) scale(1.25)`}
        />
        {SPRIG.berries.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="3.2" />
        ))}
      </g>
    </svg>
  )
}

// Embossed floral decoration. The same layer is placed inside every flap;
// each flap clips it to its own triangle, so the pattern looks continuous
// when the envelope is closed and each flap carries its own piece when it opens.
function Decor() {
  const items: { left: string; top: string; rot: number; k: number }[] = [
    { left: 'calc(var(--sw) * -0.1)', top: 'calc(var(--sw) * -1.45)', rot: 113, k: 1 },
    { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(var(--sw) * -1.45)', rot: 203, k: 1 },
    { left: 'calc(var(--sw) * -0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 23, k: 1 },
    { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(100% - var(--sw) * 1.45)', rot: 293, k: 1 },
    { left: 'calc(var(--sw) * -0.1)', top: 'calc(62% - var(--sw) * 1.45)', rot: 68, k: 0.8 },
    { left: 'calc(100% - var(--sw) * 0.1)', top: 'calc(38% - var(--sw) * 1.45)', rot: 248, k: 0.8 },
  ]
  return (
    <div className="decor">
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

// Champagne-gold wax seal: scalloped edge with an embossed swan
function Seal() {
  const bumps = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2
    return { x: 50 + Math.cos(a) * 41, y: 50 + Math.sin(a) * 41 }
  })
  // Swan silhouette, drawn twice (highlight + shadow) for the embossed look
  const swan = (
    <>
      <path
        d="M36 53 C27 49 29 38 36 34 C40 31.5 39 27.5 43 27"
        fill="none"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="44" cy="27.4" r="2.6" stroke="none" />
      <path d="M46 26.6 L51.5 28.2 L46 29.8 Z" stroke="none" />
      <path
        d="M31 58 C37 68 55 70 65 58 C67 53 66 47 71 41 C69 49 70 53 66 56 C61 60 54 59 51 52 C47 57 39 56 36 51 C33 53 31 55 31 58 Z"
        stroke="none"
      />
      <path d="M40 63 C46 66 54 66 60 62" fill="none" strokeWidth="1" strokeLinecap="round" />
    </>
  )
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
      <defs>
        <radialGradient id="sealRose" gradientUnits="userSpaceOnUse" cx="35" cy="26" r="88">
          <stop offset="0" stopColor="#f3e3b8" />
          <stop offset="0.45" stopColor="#d2ae68" />
          <stop offset="1" stopColor="#8c6c34" />
        </radialGradient>
      </defs>
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="9.5" fill="url(#sealRose)" />
      ))}
      <circle cx="50" cy="50" r="42" fill="url(#sealRose)" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,244,230,0.55)" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="32.6" fill="none" stroke="rgba(90,66,26,0.4)" strokeWidth="0.8" />
      <g transform="translate(0.9 0.9)" fill="rgba(255,246,232,0.85)" stroke="rgba(255,246,232,0.85)">
        {swan}
      </g>
      <g fill="#7d5f2c" stroke="#7d5f2c">
        {swan}
      </g>
    </svg>
  )
}

const css = `
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;perspective:1600px;background:#0c0c0b;
  --seal:clamp(104px,24vmin,170px);--sw0:clamp(130px,42vmin,360px);
  transition:opacity 1.1s ease,visibility 1.1s;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}

/* ---------- Paper revealed when the flaps open ---------- */
.inv-letter{position:absolute;inset:0;z-index:1;}

/* ---------- Flaps ---------- */
.flap{position:absolute;inset:0;backface-visibility:hidden;will-change:transform;
  filter:drop-shadow(0 4px 10px rgba(0,0,0,.7));}
.flap-in{position:absolute;inset:0;overflow:hidden;}
.flap-in::before{content:'';position:absolute;inset:0;pointer-events:none;}
.f-top{z-index:4;transform-origin:50% 0;}
.f-top .flap-in{clip-path:polygon(0 0,100% 0,50% 50.15%);}
.f-top .flap-in::before{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(0,0,0,.38));}
.f-bottom{z-index:3;transform-origin:50% 100%;}
.f-bottom .flap-in{clip-path:polygon(0 100%,100% 100%,50% 49.85%);}
.f-bottom .flap-in::before{background:linear-gradient(0deg,rgba(255,255,255,.07),rgba(0,0,0,.34));}
.f-left{z-index:5;transform-origin:0 50%;}
.f-left .flap-in{clip-path:polygon(0 0,50.1% 50%,0 100%);}
.f-left .flap-in::before{background:linear-gradient(90deg,rgba(255,255,255,.05),rgba(0,0,0,.4));}
.f-right{z-index:5;transform-origin:100% 50%;}
.f-right .flap-in{clip-path:polygon(100% 0,49.9% 50%,100% 100%);}
.f-right .flap-in::before{background:linear-gradient(270deg,rgba(255,255,255,.05),rgba(0,0,0,.32));}

/* Raised relief: light from the top-left, so a highlight on that edge and a cast shadow bottom-right */
.decor{position:absolute;inset:0;pointer-events:none;
  filter:drop-shadow(-.8px -.8px .4px rgba(255,255,255,.14)) drop-shadow(1.2px 1.6px 1px rgba(0,0,0,.8));}

.is-flap .f-top{animation:openTop 1.5s cubic-bezier(.6,.05,.3,1) forwards;}
.is-flap .f-bottom{animation:openBottom 1.5s cubic-bezier(.6,.05,.3,1) .12s forwards;}
.is-flap .f-left{animation:openLeft 1.5s cubic-bezier(.6,.05,.3,1) .24s forwards;}
.is-flap .f-right{animation:openRight 1.5s cubic-bezier(.6,.05,.3,1) .24s forwards;}
@keyframes openTop{0%{transform:rotateX(0);opacity:1}75%{opacity:1}100%{transform:rotateX(-105deg);opacity:0}}
@keyframes openBottom{0%{transform:rotateX(0);opacity:1}75%{opacity:1}100%{transform:rotateX(105deg);opacity:0}}
@keyframes openLeft{0%{transform:rotateY(0);opacity:1}75%{opacity:1}100%{transform:rotateY(105deg);opacity:0}}
@keyframes openRight{0%{transform:rotateY(0);opacity:1}75%{opacity:1}100%{transform:rotateY(-105deg);opacity:0}}

/* ---------- Wax seal (also the tap target) ---------- */
.seal{position:absolute;left:50%;top:50%;z-index:10;width:var(--seal);height:var(--seal);
  margin:calc(var(--seal) / -2) 0 0 calc(var(--seal) / -2);padding:0;border:0;background:none;cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  filter:drop-shadow(0 8px 12px rgba(0,0,0,.65)) drop-shadow(0 1px 1px rgba(0,0,0,.5));}
.seal.broken{cursor:default;}
.seal:focus-visible{outline:2px solid #cfa95f;outline-offset:8px;border-radius:50%;}
.seal:not(.broken){animation:sealPulse 2.6s ease-in-out infinite;}
.seal:not(.broken):hover{filter:drop-shadow(0 8px 12px rgba(0,0,0,.7)) brightness(1.05);}
@keyframes sealPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.seal-half{position:absolute;inset:0;display:block;}
.seal-l{clip-path:inset(0 50% 0 0);}
.seal-r{clip-path:inset(0 0 0 50%);}
.is-seal .seal-l{animation:sealL .8s ease-in forwards;}
.is-seal .seal-r{animation:sealR .8s ease-in forwards;}
@keyframes sealL{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(-26px,60px) rotate(-24deg);opacity:0}}
@keyframes sealR{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(26px,64px) rotate(24deg);opacity:0}}

/* ---------- Petals ---------- */
.petals{position:absolute;inset:0;pointer-events:none;z-index:11;overflow:hidden;}
.petal{position:absolute;top:-30px;border-radius:150% 0 150% 0;opacity:.7;animation:petalFall linear infinite;
  box-shadow:0 2px 6px rgba(120,80,60,.15);}
@keyframes petalFall{
  0%{transform:translate3d(0,-5vh,0) rotate(0deg)}
  50%{transform:translate3d(calc(var(--dx) * .5),55vh,0) rotate(180deg)}
  100%{transform:translate3d(var(--dx),110vh,0) rotate(360deg)}
}
@media (prefers-reduced-motion:reduce){
  .seal:not(.broken){animation:none;}
  .petal{animation:none;opacity:0;}
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

    // Timeline: seal cracks -> flaps open -> fade into the page
    setStage('seal')
    timers.current.push(setTimeout(() => setStage('flap'), 800))
    timers.current.push(setTimeout(() => setStage('fade'), 3000))
    timers.current.push(setTimeout(() => setStage('done'), 4200))
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
          {/* Plain black paper, hidden behind the flaps until they open */}
          <div
            className="inv-letter"
            style={paper('radial-gradient(ellipse at 50% 40%,#1d1c1a 0%,#121211 70%,#0a0a09 100%)')}
          />

          {/* Four flaps meeting in an X: black paper, soft fold shading, embossed vine ornament */}
          <div className="flap f-bottom">
            <div className="flap-in" style={paper('linear-gradient(0deg,#191817,#10100f)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-top">
            <div className="flap-in" style={paper('linear-gradient(180deg,#1c1b19,#10100f)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-left">
            <div className="flap-in" style={paper('linear-gradient(90deg,#171615,#10100f)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-right">
            <div className="flap-in" style={paper('linear-gradient(270deg,#1a1918,#10100f)')}>
              <Decor />
            </div>
          </div>

          {/* Wax seal: tap it to open */}
          <button
            type="button"
            className={`seal ${reached('seal') ? 'broken' : ''}`}
            onClick={handleOpen}
            aria-label={`Open invitation for ${guestName}`}
          >
            <span className="seal-half seal-l">
              <Seal />
            </span>
            <span className="seal-half seal-r">
              <Seal />
            </span>
          </button>

          {/* Floating petals */}
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