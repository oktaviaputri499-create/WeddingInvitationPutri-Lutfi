const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 8 + ((i * 5) % 10),
  duration: 11 + ((i * 3) % 9),
  delay: -((i * 1.9) % 14),
  opacity: 0.55 + ((i * 7) % 4) * 0.1,
  tint: i % 3 === 0 ? 'rgba(190,222,252,0.95)' : 'rgba(255,255,255,0.9)',
}))

/* ---------- Tiny pixel-art helpers ---------- */

type Rect = { x: number; y: number; w: number; c: string }

// Turns rows of characters into horizontal runs (one <rect> per run)
function toRects(rows: string[], colors: Record<string, string>): Rect[] {
  const out: Rect[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row.charAt(x)
      if (ch === '.' || !(ch in colors)) {
        x++
        continue
      }
      let e = x + 1
      while (e < row.length && row.charAt(e) === ch) e++
      out.push({ x, y, w: e - x, c: colors[ch] })
      x = e
    }
  })
  return out
}

function PixelArt({ rows, rects }: { rows: string[]; rects: Rect[] }) {
  const w = Math.max(...rows.map(r => r.length))
  return (
    <svg
      viewBox={`0 0 ${w} ${rows.length}`}
      width="100%"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />
      ))}
    </svg>
  )
}

/* ---------- Pixel clouds ---------- */
// W = white, L = light blue shadow
const CLOUD_COLORS: Record<string, string> = { W: '#ffffff', L: '#cfe3f7' }

const CLOUD_A = [
  '........WWWW............',
  '......WWWWWWWW..WWWW....',
  '.....WWWWWWWWWWWWWWWW...',
  '..WWWWWWWWWWWWWWWWWWWW..',
  '.WWWWWWWWWWWWWWWWWWWWWW.',
  'WWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWW',
  '.LLLLLLLLLLLLLLLLLLLLLL.',
  '..LLLLLLLLLLLLLLLLLLLL..',
]

const CLOUD_B = [
  '.....WWWW.......',
  '...WWWWWWWW.WWW.',
  '..WWWWWWWWWWWWW.',
  '.WWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  '.LLLLLLLLLLLLLL.',
  '..LLLLLLLLLLLL..',
]

const CLOUD_A_RECTS = toRects(CLOUD_A, CLOUD_COLORS)
const CLOUD_B_RECTS = toRects(CLOUD_B, CLOUD_COLORS)

// Top left and top right of the screen
const CLOUDS = [
  { kind: 'A', style: { left: '3%', top: '5%', width: 'clamp(140px, 17vw, 330px)' }, dur: 42, delay: 0 },
  { kind: 'B', style: { left: '19%', top: '24%', width: 'clamp(100px, 11vw, 210px)' }, dur: 34, delay: -9 },
  { kind: 'B', style: { right: '5%', top: '7%', width: 'clamp(110px, 12vw, 230px)' }, dur: 36, delay: -15 },
  { kind: 'A', style: { right: '17%', top: '25%', width: 'clamp(140px, 16vw, 310px)' }, dur: 46, delay: -22 },
]

/* ---------- Pixel garden ---------- */
// G = grass, g = dark green, D = soil, l = light green, R = red, r = dark red, Y = yellow
const GARDEN_COLORS: Record<string, string> = {
  G: '#69b878',
  g: '#3f8f5a',
  D: '#2f7a4a',
  l: '#a4dfa8',
  R: '#e8465f',
  r: '#b52f4b',
  Y: '#ffd86b',
}

const GW = 56
const GH = 20

type FlowerKind = 'round' | 'tulip'

// Builds a garden strip. The left side is tall, and it slopes down toward the right side.
function buildGarden(
  seed: number,
  bushes: Array<[number, number]>,
  flowers: Array<[number, number, FlowerKind]>
): string[] {
  const g: string[][] = Array.from({ length: GH }, () => Array<string>(GW).fill('.'))
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && x < GW && y >= 0 && y < GH) g[y][x] = c
  }

  // Fixed pseudo-random numbers (same result every time)
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }

  // Height of the ground at column x
  const top = (x: number) => GH - Math.round(2 + 3 * Math.pow(1 - x / GW, 0.9))

  // Bushes (dome shape with light on the upper left)
  bushes.forEach(([cx, r]) => {
    const base = top(cx) + 1
    const rx = r * 1.5
    for (let dy = -r; dy <= 0; dy++) {
      for (let dx = -Math.round(rx); dx <= Math.round(rx); dx++) {
        const nx = dx / rx
        const ny = dy / r
        if (nx * nx + ny * ny <= 1) {
          const shade = nx + ny < -0.7 ? 'l' : nx + ny < -0.1 ? 'G' : 'g'
          set(cx + dx, base + dy, shade)
        }
      }
    }
  })

  // Ground
  for (let x = 0; x < GW; x++) {
    const t = top(x)
    set(x, t, 'G')
    for (let y = t + 1; y < GH; y++) set(x, y, y === t + 1 ? 'g' : 'D')
  }

  // Grass blades
  for (let x = 0; x < GW; x++) {
    const t = top(x)
    const r = rnd()
    if (r < 0.35) {
      set(x, t - 1, 'G')
      if (rnd() < 0.5) set(x, t - 2, 'g')
    } else if (r < 0.5) {
      set(x, t - 1, 'l')
    }
  }

  // Red flowers with stems and leaves
  flowers.forEach(([x, h, kind]) => {
    const t = top(x)
    const ty = t - h
    for (let y = ty + 1; y < t; y++) set(x, y, 'g')
    const ly = t - Math.max(2, Math.floor(h / 2))
    set(x - 1, ly, 'G')
    set(x - 2, ly - 1, 'G')
    set(x + 1, ly + 1, 'G')
    set(x + 2, ly, 'G')

    if (kind === 'round') {
      set(x, ty - 1, 'R')
      set(x - 1, ty, 'R')
      set(x + 1, ty, 'R')
      set(x, ty + 1, 'R')
      set(x - 1, ty - 1, 'r')
      set(x + 1, ty - 1, 'r')
      set(x - 1, ty + 1, 'r')
      set(x + 1, ty + 1, 'r')
      set(x, ty, 'Y')
    } else {
      set(x - 1, ty - 1, 'R')
      set(x + 1, ty - 1, 'R')
      set(x - 1, ty, 'R')
      set(x, ty, 'R')
      set(x + 1, ty, 'R')
      set(x, ty + 1, 'r')
    }
  })

  return g.map(row => row.join(''))
}

const GARDEN_L = buildGarden(
  7,
  [[7, 5], [24, 4], [42, 4], [52, 3]],
  [
    [3, 8, 'round'], [9, 10, 'tulip'], [15, 7, 'round'], [21, 9, 'round'],
    [29, 8, 'tulip'], [35, 6, 'round'], [41, 8, 'round'], [47, 5, 'tulip'],
  ]
)

const GARDEN_R = buildGarden(
  19,
  [[6, 4], [20, 5], [36, 4], [50, 3]],
  [
    [4, 6, 'tulip'], [11, 9, 'round'], [18, 7, 'tulip'], [25, 10, 'round'],
    [32, 6, 'round'], [38, 8, 'tulip'], [45, 7, 'round'], [51, 5, 'round'],
  ]
)

const GARDEN_L_RECTS = toRects(GARDEN_L, GARDEN_COLORS)
const GARDEN_R_RECTS = toRects(GARDEN_R, GARDEN_COLORS)

/* ---------- Vines ---------- */

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

/* ---------- Background ---------- */

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
      <style>{`
        @keyframes pxCloudDrift{from{transform:translateX(-18px)}to{transform:translateX(22px)}}
        .px-cloud{opacity:.96}
        .px-garden{opacity:1}
        @media (max-width:640px){
          .px-cloud{opacity:.55}
          .px-garden{opacity:.55}
        }
        @media (prefers-reduced-motion:reduce){.px-cloud{animation:none !important}}
      `}</style>

      {/* Pixel clouds (top left and top right) */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute px-cloud"
          style={{
            ...c.style,
            animation: `pxCloudDrift ${c.dur}s ease-in-out ${c.delay}s infinite alternate`,
          }}
        >
          {c.kind === 'A' ? (
            <PixelArt rows={CLOUD_A} rects={CLOUD_A_RECTS} />
          ) : (
            <PixelArt rows={CLOUD_B} rects={CLOUD_B_RECTS} />
          )}
        </div>
      ))}

      <Vine />
      <Vine flip />

      {/* Pixel garden (bottom left and bottom right) */}
      <div
        className="absolute px-garden"
        style={{ left: 0, bottom: 0, width: 'clamp(260px, 36vw, 700px)' }}
      >
        <PixelArt rows={GARDEN_L} rects={GARDEN_L_RECTS} />
      </div>
      <div
        className="absolute px-garden"
        style={{ right: 0, bottom: 0, width: 'clamp(260px, 36vw, 700px)', transform: 'scaleX(-1)' }}
      >
        <PixelArt rows={GARDEN_R} rects={GARDEN_R_RECTS} />
      </div>

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