'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

type Stage = 'closed' | 'seal' | 'flap' | 'letter' | 'fade' | 'done'
const ORDER: Stage[] = ['closed', 'seal', 'flap', 'letter', 'fade', 'done']

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 10 + ((i * 7) % 12),
  duration: 7 + ((i * 13) % 7),
  delay: -((i * 29) % 10),
  dx: (i % 2 ? 1 : -1) * (30 + ((i * 11) % 60)),
  color: ['#f4cdd2', '#fbe3e6', '#ffffff', '#efc0c8'][i % 4],
}))

// Subtle paper grain, used as a texture on the envelope and the letter
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`

const css = `
.inv-root{position:fixed;inset:0;z-index:50;overflow:hidden;transition:opacity 1s ease,visibility 1s;}
.inv-root.is-fade{opacity:0;visibility:hidden;pointer-events:none;}

.inv-title{position:absolute;top:9vh;left:0;right:0;text-align:center;padding:0 24px;transition:opacity .6s ease;}
.inv-root.is-flap .inv-title{opacity:0;}

.env{position:relative;width:320px;height:220px;margin-top:90px;scale:1;
  filter:drop-shadow(0 22px 28px rgba(60,40,25,.28));animation:envFloat 5s ease-in-out infinite;}
@media (max-width:380px){.env{scale:.86;}}
@keyframes envFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

.env-back{position:absolute;inset:0;z-index:0;border-radius:4px;}
.env-letter{position:absolute;left:20px;top:14px;width:280px;height:190px;z-index:2;border-radius:3px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px;
  box-shadow:0 2px 10px rgba(60,40,25,.2);}
.is-letter .env-letter{animation:letterRise 1.3s cubic-bezier(.22,.8,.28,1) forwards;}
@keyframes letterRise{
  0%{transform:translateY(0) scale(1);z-index:2}
  45%{transform:translateY(-120px) scale(1);z-index:2}
  46%{z-index:6}
  100%{transform:translateY(-70px) scale(1.12);z-index:6}
}

.env-flap{position:absolute;left:0;top:0;width:320px;height:122px;z-index:5;transform-origin:50% 0;
  clip-path:polygon(0 0,100% 0,50% 100%);}
.is-flap .env-flap{animation:flapOpen .9s ease-in-out forwards;}
@keyframes flapOpen{
  0%{transform:perspective(900px) rotateX(0deg);z-index:5;filter:brightness(1)}
  49%{z-index:5}
  50%{z-index:1}
  100%{transform:perspective(900px) rotateX(180deg);z-index:1;filter:brightness(.93)}
}

.pk{position:absolute;inset:0;z-index:3;}
.pk-left{clip-path:polygon(0 0,52% 52%,0 100%);}
.pk-right{clip-path:polygon(100% 0,48% 52%,100% 100%);}
.pk-bottom{clip-path:polygon(0 100%,50% 40%,100% 100%);}

.seal{position:absolute;left:50%;top:118px;width:58px;height:58px;margin:-29px 0 0 -29px;z-index:7;}
.seal:not(.broken){animation:sealPulse 2.4s ease-in-out infinite;}
@keyframes sealPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.seal-half{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 35% 30%,#c0392b 0%,#8e1f17 60%,#5e120d 100%);
  box-shadow:inset 0 0 0 4px rgba(255,255,255,.08),inset 0 -4px 8px rgba(0,0,0,.35),0 3px 8px rgba(0,0,0,.35);
  color:#f5d9a8;font-family:Georgia,serif;font-size:16px;font-weight:bold;letter-spacing:1px;}
.seal-l{clip-path:inset(0 50% 0 0);}
.seal-r{clip-path:inset(0 0 0 50%);}
.is-seal .seal-l{animation:sealL .7s ease-in forwards;}
.is-seal .seal-r{animation:sealR .7s ease-in forwards;}
@keyframes sealL{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(-18px,28px) rotate(-26deg);opacity:0}}
@keyframes sealR{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(18px,30px) rotate(26deg);opacity:0}}

.inv-btn{margin-top:36px;padding:13px 34px;border-radius:999px;border:1px solid #b08d57;background:#4a3b32;color:#fff;
  font-size:14px;letter-spacing:.12em;cursor:pointer;
  box-shadow:0 8px 20px rgba(74,59,50,.3);transition:opacity .5s ease,transform .2s ease,background .2s ease;}
.inv-btn:hover{background:#b08d57;transform:translateY(-2px);}
.inv-btn.hide{opacity:0;pointer-events:none;}
.inv-guest{margin-top:20px;font-size:12px;color:#78716c;font-style:italic;transition:opacity .5s ease;}
.inv-guest.hide{opacity:0;}

.petals{position:absolute;inset:0;pointer-events:none;z-index:11;overflow:hidden;}
.petal{position:absolute;top:-30px;border-radius:150% 0 150% 0;opacity:.85;animation:petalFall linear infinite;
  box-shadow:0 2px 6px rgba(120,60,70,.15);}
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

    // Timeline: seal cracks -> flap opens -> letter rises -> fade into the page
    setStage('seal')
    timers.current.push(setTimeout(() => setStage('flap'), 700))
    timers.current.push(setTimeout(() => setStage('letter'), 1600))
    timers.current.push(setTimeout(() => setStage('fade'), 3500))
    timers.current.push(setTimeout(() => setStage('done'), 4600))
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
    'inv-root bg-cream',
    reached('seal') && 'is-seal',
    reached('flap') && 'is-flap',
    reached('letter') && 'is-letter',
    reached('fade') && 'is-fade',
  ]
    .filter(Boolean)
    .join(' ')

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
          {/* Video background, dimmed */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-[38%]"
          >
            <source src="/intro-bg.mp4" type="video/mp4" />
          </video>

          {/* Cream overlay to keep it subtle */}
          <div className="absolute inset-0 bg-cream/70" />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            <div className="inv-title">
              <p className="text-sm tracking-[0.3em] uppercase text-dark-brown/70 font-medium">
                We invite you to The Wedding of
              </p>
            </div>

            {/* Envelope */}
            <div className="env">
              <div
                className="env-back"
                style={{ backgroundImage: `${GRAIN}, linear-gradient(180deg,#e9dcc6,#dccbb0)` }}
              />

              <div
                className="env-letter"
                style={{ backgroundImage: `${GRAIN}, radial-gradient(circle at 30% 20%,#fffdf8,#f7efe0)` }}
              >
                <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6b5a4e' }}>
                  The Wedding Of
                </p>
                <p style={{ fontFamily: script, fontSize: 46, lineHeight: 1.05, color: '#b08d57', margin: '6px 0' }}>
                  {groomName} &amp; {brideName}
                </p>
                <div style={{ width: 60, height: 1, background: '#b08d57', opacity: 0.6, margin: '6px 0' }} />
                <p style={{ fontSize: 11, color: '#6b5a4e', fontStyle: 'italic' }}>You are cordially invited</p>
              </div>

              <div className="pk pk-left" style={{ backgroundImage: `${GRAIN}, linear-gradient(100deg,#e7dac3,#d9c8ab)` }} />
              <div className="pk pk-right" style={{ backgroundImage: `${GRAIN}, linear-gradient(260deg,#e7dac3,#d9c8ab)` }} />
              <div className="pk pk-bottom" style={{ backgroundImage: `${GRAIN}, linear-gradient(180deg,#e0d0b5,#d1bd9c)` }} />

              <div className="env-flap" style={{ backgroundImage: `${GRAIN}, linear-gradient(180deg,#e2d3ba,#d4c1a2)` }} />

              <div className={`seal ${reached('seal') ? 'broken' : ''}`}>
                <div className="seal-half seal-l">{initials}</div>
                <div className="seal-half seal-r">{initials}</div>
              </div>
            </div>

            <button className={`inv-btn ${stage !== 'closed' ? 'hide' : ''}`} onClick={handleOpen}>
              Open the Invitation
            </button>
            <p className={`inv-guest ${stage !== 'closed' ? 'hide' : ''}`}>For {guestName}</p>
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