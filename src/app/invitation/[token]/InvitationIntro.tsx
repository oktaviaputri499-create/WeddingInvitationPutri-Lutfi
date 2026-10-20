'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'seal' | 'flap' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'seal', 'flap', 'fade', 'done']

const PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 9 + ((i * 7) % 11),
  duration: 8 + ((i * 13) % 7),
  delay: -((i * 29) % 12),
  dx: (i % 2 ? 1 : -1) * (30 + ((i * 11) % 60)),
  color: ['#f3dcdc', '#ead3a6', '#ffffff', '#ebcfcf'][i % 4],
}))

// Subtle paper grain
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
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

function Sprig({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 300" style={style} aria-hidden>
      <g fill="#efe6d5" stroke="#e1d3b8" strokeWidth="0.8">
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

// Champagne-gold wax seal with a scalloped edge and monogram
function Seal({ initials }: { initials: string }) {
  const bumps = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2
    return { x: 50 + Math.cos(a) * 41, y: 50 + Math.sin(a) * 41 }
  })
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
      <defs>
        <radialGradient id="sealGold" gradientUnits="userSpaceOnUse" cx="35" cy="28" r="85">
          <stop offset="0" stopColor="#f6e8c4" />
          <stop offset="0.45" stopColor="#d9bb7c" />
          <stop offset="1" stopColor="#a6823f" />
        </radialGradient>
      </defs>
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="9" fill="url(#sealGold)" />
      ))}
      <circle cx="50" cy="50" r="42" fill="url(#sealGold)" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,248,226,0.8)" strokeWidth="1.3" />
      <circle cx="50" cy="50" r="31.4" fill="none" stroke="rgba(120,88,36,0.45)" strokeWidth="0.8" />
      <text
        x="50.7"
        y="58.2"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="22"
        fill="rgba(255,250,232,0.9)"
      >
        {initials}
      </text>
      <text
        x="50"
        y="57.5"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="22"
        fill="#86642a"
      >
        {initials}
      </text>
    </svg>
  )
}

const css = `
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;perspective:1600px;background:#efe6d6;
  --seal:clamp(104px,24vmin,170px);--sw0:clamp(130px,42vmin,360px);
  transition:opacity 1.1s ease,visibility 1.1s;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}

/* ---------- Letter (revealed when the flaps open) ---------- */
.inv-letter{position:absolute;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 8%;}
.inv-letter::before{content:'';position:absolute;inset:clamp(12px,2.6vmin,24px);border:1px solid rgba(176,141,87,.65);}
.inv-letter::after{content:'';position:absolute;inset:calc(clamp(12px,2.6vmin,24px) + 6px);border:1px solid rgba(176,141,87,.28);}
.letter-c{position:relative;opacity:0;transform:translateY(16px) scale(.98);}
.is-flap .letter-c{animation:letterIn 1.4s ease .9s forwards;}
@keyframes letterIn{to{opacity:1;transform:none}}
.letter-label{font-size:clamp(10px,1.9vmin,14px);letter-spacing:.42em;text-transform:uppercase;color:#6b5a4e;}
.letter-names{font-size:clamp(2.6rem,11vmin,6rem);line-height:1.1;color:#b08d57;margin:.18em 0 .1em;}
.letter-sub{font-size:clamp(11px,2vmin,15px);font-style:italic;color:#6b5a4e;}
.divider{display:flex;align-items:center;justify-content:center;gap:10px;margin:.7em 0;}
.divider span{display:block;width:clamp(36px,9vmin,70px);height:1px;background:#b08d57;opacity:.7;}
.divider i{display:block;width:7px;height:7px;border:1px solid #b08d57;transform:rotate(45deg);}

/* ---------- Flaps ---------- */
.flap{position:absolute;inset:0;backface-visibility:hidden;will-change:transform;
  filter:drop-shadow(0 0 1.2px rgba(90,68,38,.5));}
.flap-in{position:absolute;inset:0;overflow:hidden;}
.flap-in::after{content:'';position:absolute;inset:clamp(10px,2.2vmin,20px);border:1px solid rgba(176,141,87,.55);pointer-events:none;}
.f-top{z-index:4;transform-origin:50% 0;}
.f-top .flap-in{clip-path:polygon(0 0,100% 0,50% 50.15%);}
.f-bottom{z-index:3;transform-origin:50% 100%;}
.f-bottom .flap-in{clip-path:polygon(0 100%,100% 100%,50% 49.85%);}
.f-left{z-index:5;transform-origin:0 50%;}
.f-left .flap-in{clip-path:polygon(0 0,50.1% 50%,0 100%);}
.f-right{z-index:5;transform-origin:100% 50%;}
.f-right .flap-in{clip-path:polygon(100% 0,49.9% 50%,100% 100%);}

.decor{position:absolute;inset:0;pointer-events:none;
  filter:drop-shadow(1.2px 1.2px .6px rgba(255,255,255,.95)) drop-shadow(-1px -1px .8px rgba(150,125,90,.3));}

.is-flap .f-top{animation:openTop 1.5s cubic-bezier(.6,.05,.3,1) forwards;}
.is-flap .f-bottom{animation:openBottom 1.5s cubic-bezier(.6,.05,.3,1) .12s forwards;}
.is-flap .f-left{animation:openLeft 1.5s cubic-bezier(.6,.05,.3,1) .24s forwards;}
.is-flap .f-right{animation:openRight 1.5s cubic-bezier(.6,.05,.3,1) .24s forwards;}
@keyframes openTop{0%{transform:rotateX(0);opacity:1}75%{opacity:1}100%{transform:rotateX(-105deg);opacity:0}}
@keyframes openBottom{0%{transform:rotateX(0);opacity:1}75%{opacity:1}100%{transform:rotateX(105deg);opacity:0}}
@keyframes openLeft{0%{transform:rotateY(0);opacity:1}75%{opacity:1}100%{transform:rotateY(105deg);opacity:0}}
@keyframes openRight{0%{transform:rotateY(0);opacity:1}75%{opacity:1}100%{transform:rotateY(-105deg);opacity:0}}

/* ---------- Wax seal ---------- */
.seal{position:absolute;left:50%;top:50%;z-index:10;width:var(--seal);height:var(--seal);
  margin:calc(var(--seal) / -2) 0 0 calc(var(--seal) / -2);filter:drop-shadow(0 6px 10px rgba(80,55,20,.4));}
.seal:not(.broken){animation:sealPulse 2.6s ease-in-out infinite;}
@keyframes sealPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.seal-half{position:absolute;inset:0;}
.seal-l{clip-path:inset(0 50% 0 0);}
.seal-r{clip-path:inset(0 0 0 50%);}
.is-seal .seal-l{animation:sealL .8s ease-in forwards;}
.is-seal .seal-r{animation:sealR .8s ease-in forwards;}
@keyframes sealL{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(-26px,60px) rotate(-24deg);opacity:0}}
@keyframes sealR{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(26px,64px) rotate(24deg);opacity:0}}

/* ---------- Text and button on the envelope ---------- */
.inv-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 6vh);left:0;right:0;z-index:12;text-align:center;padding:0 24px;transition:opacity .6s ease;}
.inv-top p{font-size:clamp(10px,1.9vmin,14px);letter-spacing:.34em;text-transform:uppercase;color:#6b5a4e;}
.inv-bottom{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 7vh);left:0;right:0;z-index:12;
  display:flex;flex-direction:column;align-items:center;gap:12px;padding:0 24px;text-align:center;transition:opacity .6s ease;}
.inv-bottom .lbl{font-size:clamp(10px,1.8vmin,13px);letter-spacing:.3em;text-transform:uppercase;color:#8a7b6e;}
.inv-bottom .nm{font-size:clamp(1.5rem,5.5vmin,2.4rem);line-height:1.15;color:#b08d57;max-width:80%;text-wrap:balance;}
.is-seal .inv-top,.is-seal .inv-bottom{opacity:0;pointer-events:none;}
.inv-btn{margin-top:6px;padding:14px 38px;border-radius:999px;border:1px solid #b08d57;
  background:linear-gradient(180deg,#cfb074,#a98446);color:#fff;font-size:13px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;
  text-shadow:0 1px 1px rgba(90,60,20,.35);
  box-shadow:0 10px 24px rgba(120,90,40,.3),inset 0 1px 0 rgba(255,255,255,.45);transition:transform .2s ease,filter .2s ease;}
.inv-btn:hover{transform:translateY(-2px);filter:brightness(1.07);}

@media (max-height:520px){
  .inv-top p.sub{display:none;}
  .inv-bottom{bottom:3vh;gap:6px;}
  .inv-bottom .lbl{display:none;}
}

/* ---------- Petals ---------- */
.petals{position:absolute;inset:0;pointer-events:none;z-index:11;overflow:hidden;}
.petal{position:absolute;top:-30px;border-radius:150% 0 150% 0;opacity:.8;animation:petalFall linear infinite;
  box-shadow:0 2px 6px rgba(120,80,60,.15);}
@keyframes petalFall{
  0%{transform:translate3d(0,-5vh,0) rotate(0deg)}
  50%{transform:translate3d(calc(var(--dx) * .5),55vh,0) rotate(180deg)}
  100%{transform:translate3d(var(--dx),110vh,0) rotate(360deg)}
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
  groomName = 'Lutfi',
  brideName = 'Putri',
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

    // Timeline: seal cracks -> flaps open -> letter shown -> fade into the page
    setStage('seal')
    timers.current.push(setTimeout(() => setStage('flap'), 800))
    timers.current.push(setTimeout(() => setStage('fade'), 5200))
    timers.current.push(setTimeout(() => setStage('done'), 6400))
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

  const initials = `${groomName.charAt(0)}&${brideName.charAt(0)}`.toUpperCase()
  const script = "'Edwardian Script ITC', 'Lucida Calligraphy', 'Baskerville', cursive"

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
          {/* The letter, hidden behind the flaps until they open */}
          <div
            className="inv-letter"
            style={paper('radial-gradient(ellipse at 50% 40%,#fffdf8 0%,#f8f1e4 70%,#efe4d0 100%)')}
          >
            <div className="letter-c">
              <p className="letter-label">The Wedding Of</p>
              <h2 className="letter-names" style={{ fontFamily: script, fontWeight: 400 }}>
                {groomName} <span style={{ fontSize: '0.7em', opacity: 0.85 }}>&amp;</span> {brideName}
              </h2>
              <div className="divider">
                <span />
                <i />
                <span />
              </div>
              <p className="letter-sub">You are cordially invited</p>
            </div>
          </div>

          {/* Four flaps meeting in an X */}
          <div className="flap f-bottom">
            <div className="flap-in" style={paper('linear-gradient(0deg,#faf6ee,#f1e9da)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-top">
            <div className="flap-in" style={paper('linear-gradient(180deg,#f8f3ea,#ece3d1)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-left">
            <div className="flap-in" style={paper('linear-gradient(90deg,#f4eddf,#ebe1cf)')}>
              <Decor />
            </div>
          </div>
          <div className="flap f-right">
            <div className="flap-in" style={paper('linear-gradient(270deg,#faf6ed,#efe6d6)')}>
              <Decor />
            </div>
          </div>

          {/* Wax seal */}
          <div className={`seal ${reached('seal') ? 'broken' : ''}`}>
            <div className="seal-half seal-l">
              <Seal initials={initials} />
            </div>
            <div className="seal-half seal-r">
              <Seal initials={initials} />
            </div>
          </div>

          <div className="inv-top">
            <p className="sub">We invite you to</p>
            <p>The Wedding of</p>
          </div>

          <div className="inv-bottom">
            <span className="lbl">Special invitation for</span>
            <span className="nm" style={{ fontFamily: script }}>
              {guestName}
            </span>
            <button className="inv-btn" onClick={handleOpen}>
              Open Invitation
            </button>
          </div>

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