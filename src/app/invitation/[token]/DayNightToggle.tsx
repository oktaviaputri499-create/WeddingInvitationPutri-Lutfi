'use client'

import { useEffect, useState } from 'react'

// ===== Pixel sun and moon (13 x 13 grid, one character = one pixel) =====
// Sun: R = ray, O = outline, Y = body, h = highlight
const SUN = [
  '......R......',
  '......R......',
  '..R.......R..',
  '....OOOOO....',
  '...OhhYYYO...',
  '...OhYYYYO...',
  'RR.OYYYYYO.RR',
  '...OYYYYYO...',
  '...OYYYYYO...',
  '....OOOOO....',
  '..R.......R..',
  '......R......',
  '......R......',
]

// Moon: M = light, m = shade, k = crater
const MOON = [
  '.............',
  '.............',
  '.....mMMMM...',
  '....mMMM.....',
  '...mMMM......',
  '...mMkM......',
  '...mMMM......',
  '...mkMM......',
  '...mMMM......',
  '....mMMM.....',
  '.....mMMMM...',
  '.............',
  '.............',
]

const SUN_COLORS: Record<string, string> = {
  R: '#ffe27a',
  O: '#f5a623',
  Y: '#ffd84a',
  h: '#fff3a0',
}

const MOON_COLORS: Record<string, string> = {
  M: '#fff4c2',
  m: '#e6d58a',
  k: '#d9c978',
}

// Night stars (fixed positions so the server and browser render the same thing)
const STARS = Array.from({ length: 64 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 64,
  size: i % 4 === 0 ? 3 : 2,
  plus: i % 9 === 0,
  duration: 1.6 + (i % 4) * 0.7,
  delay: -((i * 7) % 5),
  color: i % 5 === 0 ? '#ffe9a8' : '#ffffff',
}))

function Sprite({ rows, colors }: { rows: string[]; colors: Record<string, string> }) {
  return (
    <svg
      viewBox="0 0 13 13"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      aria-hidden
      style={{ display: 'block' }}
    >
      {rows.map((row, y) =>
        row.split('').map((c, x) =>
          c === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={colors[c]}
              className={c === 'R' ? 'dn-ray' : undefined}
            />
          )
        )
      )}
    </svg>
  )
}

const css = `
.dn-btn{position:fixed;top:14px;right:14px;z-index:40;width:56px;height:56px;padding:0;border:0;
  background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.dn-btn:focus-visible{outline:2px dashed #ffffff;outline-offset:6px;}
.dn-glow{position:absolute;inset:-14px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(255,226,122,.65) 0,rgba(255,226,122,0) 68%);}
.dn-glow.is-night{background:radial-gradient(circle,rgba(255,244,194,.45) 0,rgba(255,244,194,0) 68%);}
.dn-icon{position:absolute;inset:0;transition:opacity .5s steps(5,end),transform .5s steps(5,end);}
.dn-icon.is-hidden{opacity:0;transform:translateY(-12px) scale(.6);pointer-events:none;}
.dn-btn:active .dn-icon:not(.is-hidden){transform:scale(.9);}
.dn-ray{animation:dnRay 1.4s steps(1,end) infinite;}
@keyframes dnRay{0%,100%{opacity:1}50%{opacity:.35}}

/* Night: a dark blue tint over the sky, flowers and clouds (the content panels stay on top, unchanged) */
.dn-tint{position:fixed;inset:0;z-index:5;pointer-events:none;opacity:0;mix-blend-mode:multiply;
  background:linear-gradient(180deg,#141f4d 0%,#2a3a7a 55%,#5a6aa8 100%);
  transition:opacity 1.2s ease;}
.dn-tint.is-night{opacity:1;}

/* Stars */
.dn-stars{position:fixed;inset:0;z-index:6;pointer-events:none;opacity:0;transition:opacity 1.2s ease;}
.dn-stars.is-night{opacity:1;}
.dn-star{position:absolute;animation:dnTwinkle 2.4s steps(1,end) infinite;}
@keyframes dnTwinkle{0%,100%{opacity:1}50%{opacity:.2}}

/* The hero text sits directly on the sky, so it turns light at night */
html[data-night="true"] .hero-section h1,
html[data-night="true"] .hero-section p,
html[data-night="true"] .hero-section h1 span,
html[data-night="true"] .hero-section p span{
  color:#eaf4ff !important;text-shadow:0 1px 12px rgba(8,16,48,.85) !important;}

@media (prefers-reduced-motion:reduce){
  .dn-ray,.dn-star{animation:none;}
  .dn-icon,.dn-tint,.dn-stars{transition:none;}
}
`

export default function DayNightToggle() {
  const [night, setNight] = useState(false)

  // Lets CSS elsewhere (like the hero text) know it is night
  useEffect(() => {
    document.documentElement.dataset.night = night ? 'true' : 'false'
    return () => {
      delete document.documentElement.dataset.night
    }
  }, [night])

  return (
    <>
      <style>{css}</style>

      <div className={`dn-tint ${night ? 'is-night' : ''}`} aria-hidden />

      <div className={`dn-stars ${night ? 'is-night' : ''}`} aria-hidden>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="dn-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: s.plus
                ? `-3px 0 0 ${s.color}, 3px 0 0 ${s.color}, 0 -3px 0 ${s.color}, 0 3px 0 ${s.color}`
                : undefined,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className="dn-btn"
        onClick={() => setNight(n => !n)}
        aria-label={night ? 'Switch to day' : 'Switch to night'}
        aria-pressed={night}
      >
        <span className={`dn-glow ${night ? 'is-night' : ''}`} />
        <span className={`dn-icon ${night ? 'is-hidden' : ''}`}>
          <Sprite rows={SUN} colors={SUN_COLORS} />
        </span>
        <span className={`dn-icon ${night ? '' : 'is-hidden'}`}>
          <Sprite rows={MOON} colors={MOON_COLORS} />
        </span>
      </button>
    </>
  )
}