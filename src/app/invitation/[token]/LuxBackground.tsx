const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 8 + ((i * 5) % 10),
  duration: 11 + ((i * 3) % 9),
  delay: -((i * 1.9) % 14),
  opacity: 0.55 + ((i * 7) % 4) * 0.1,
  tint: i % 3 === 0 ? 'rgba(190,222,252,0.95)' : 'rgba(255,255,255,0.9)',
}))

// Builds the stem and leaf positions of one vine
const STEM_POINTS = Array.from({ length: 21 }, (_, i) => {
  const y = i * 50
  return { x: 70 + 32 * Math.sin(y / 130), y }
})
const STEM_PATH = STEM_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y}`).join(' ')
const LEAVES = STEM_POINTS.filter((_, i) => i > 0 && i < 20).map((p, i) => ({
  x: p.x,
  y: p.y,
  side: i % 2 === 0 ? -1 : 1,
}))

function Vine({ flip }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 160 1000"
      preserveAspectRatio="xMinYMid slice"
      className="absolute top-0 h-full pointer-events-none"
      style={{
        width: 160,
        [flip ? 'right' : 'left']: 0,
        transform: flip ? 'scaleX(-1)' : undefined,
        opacity: 0.85,
      }}
    >
      <path d={STEM_PATH} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
      {LEAVES.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x + l.side * 18}
          cy={l.y}
          rx="20"
          ry="8"
          transform={`rotate(${l.side * 35} ${l.x + l.side * 18} ${l.y})`}
          fill="rgba(255,255,255,0.35)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export default function LuxBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 0,
        background:
          'linear-gradient(180deg,#8ec5f5 0%,#b6dafa 40%,#dcedfd 75%,#f1f8ff 100%)',
      }}
    >
      {/* Soft clouds */}
      <div
        className="absolute"
        style={{
          top: '6%', left: '-10%', width: '60%', height: '18%',
          background: 'radial-gradient(ellipse at center,rgba(255,255,255,0.85),transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '38%', right: '-12%', width: '65%', height: '20%',
          background: 'radial-gradient(ellipse at center,rgba(255,255,255,0.75),transparent 70%)',
          filter: 'blur(12px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '4%', left: '5%', width: '70%', height: '18%',
          background: 'radial-gradient(ellipse at center,rgba(255,255,255,0.8),transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      <Vine />
      <Vine flip />

      {/* Falling petals */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: '150% 0 150% 0',
            background: p.tint,
            opacity: p.opacity,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}