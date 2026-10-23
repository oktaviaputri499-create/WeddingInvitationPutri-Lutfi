import ScrollReveal from './ScrollReveal'
import AnimatedText from './AnimatedText'

type Wish = {
  id: string | number
  message: string
  createdAt: Date | string
  guest: { name: string }
}

const INK = '#23446b'
const ACCENT = '#4a90d9'
const BODY = '#35577f'
const MUTED = '#5f82a8'
const DARK = '#2f5d8c'

/* ---------- Pixel profile (10 x 10), generated from the guest's name ---------- */
// H = hair, S = skin, E = eye, C = cheek, M = mouth, T = shirt
const FACES: string[][] = [
  // short hair
  [
    '...HHHH...',
    '..HHHHHH..',
    '..HSSSSH..',
    '..SSSSSS..',
    '..SESSES..',
    '..SCSSCS..',
    '..SSMMSS..',
    '...SSSS...',
    '.TTTTTTTT.',
    'TTTTTTTTTT',
  ],
  // long hair
  [
    '..HHHHHH..',
    '.HHHHHHHH.',
    '.HHSSSSHH.',
    '.HSSSSSSH.',
    '.HSESSESH.',
    '.HSCSSCSH.',
    '.HSSMMSSH.',
    '.HHSSSSHH.',
    '.TTTTTTTT.',
    'TTTTTTTTTT',
  ],
  // bun
  [
    '....HH....',
    '...HHHH...',
    '..HHHHHH..',
    '..HSSSSH..',
    '..SESSES..',
    '..SCSSCS..',
    '..SSMMSS..',
    '...SSSS...',
    '.TTTTTTTT.',
    'TTTTTTTTTT',
  ],
]

const HAIR = ['#3b2a2a', '#7a4a32', '#c98b4b', '#23324a', '#a0522d', '#e0b25a', '#5a3d6e', '#2b2b2b']
const SKIN = ['#ffd9b8', '#f5c49a', '#e0a878', '#c68642', '#fbe0cc']
const SHIRT = ['#4a90d9', '#f59ab9', '#7cc99a', '#f2b45a', '#a78bdb', '#e0645c', '#5bbfc7', '#2f5d8c']
const BG = ['#dcecfb', '#ffe3ea', '#e3f6e8', '#fff1d6', '#ece4fa']

function hashName(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

function PixelProfile({ name, index }: { name: string; index: number }) {
  const h = hashName(name.trim().toLowerCase())
  const rows = FACES[h % FACES.length]
  const colors: Record<string, string> = {
    H: HAIR[(h >>> 3) % HAIR.length],
    S: SKIN[(h >>> 6) % SKIN.length],
    T: SHIRT[(h >>> 9) % SHIRT.length],
    E: INK,
    C: '#f59ab9',
    M: '#c4607f',
  }
  const bg = BG[(h >>> 12) % BG.length]

  return (
    <div aria-hidden className="gb-avatar" style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 10 10" width="100%" shapeRendering="crispEdges" style={{ display: 'block' }}>
        <g className="gb-bob" style={{ animationDelay: `${(index % 5) * 0.25}s` }}>
          {rows.map((row, y) =>
            row.split('').map((c, x) =>
              c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={colors[c]} />
            )
          )}
        </g>
      </svg>
    </div>
  )
}

/* ---------- Pixel speech tail ---------- */
const TAIL = ['....D', '...DW', '..DWW', '.DWWW', '..DWW', '...DW', '....D']

function Tail() {
  return (
    <svg className="gb-tail" viewBox="0 0 5 7" shapeRendering="crispEdges" aria-hidden>
      {TAIL.map((row, y) =>
        row.split('').map((c, x) =>
          c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c === 'D' ? DARK : '#ffffff'} />
        )
      )}
    </svg>
  )
}

function formatDate(d: Date | string) {
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

function DialogRow({
  name,
  message,
  date,
  index,
}: {
  name: string
  message: string
  date?: string
  index: number
}) {
  const rev = index % 2 === 1
  return (
    <div className={`gb-row${rev ? ' rev' : ''}`}>
      <PixelProfile name={name} index={index} />
      <div className="gb-bubble">
        <Tail />
        <div className="gb-name">
          <AnimatedText text={name} startDelay={0.1} step={0.025} />
        </div>
        <div className="gb-msg">
          <AnimatedText text={message} startDelay={0.3} step={0.012} />
        </div>
        <div className="gb-foot">
          <span>{date}</span>
          <span className="gb-next" aria-hidden>
            ▼
          </span>
        </div>
      </div>
    </div>
  )
}

const css = `
.gb-wall{position:relative;padding:14px 10px;
  background:
    conic-gradient(rgba(74,144,217,.09) 25%,transparent 0 50%,rgba(74,144,217,.09) 0 75%,transparent 0) 0 0 / 16px 16px,
    rgba(255,255,255,.6);
  box-shadow:0 -4px 0 0 ${DARK},0 4px 0 0 ${DARK},-4px 0 0 0 ${DARK},4px 0 0 0 ${DARK},6px 6px 0 0 rgba(47,93,140,.25);
  margin:4px;}
.gb-head{display:flex;align-items:center;justify-content:center;gap:8px;padding:2px 8px 10px;
  font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${MUTED};}
.gb-scroll{max-height:560px;overflow-y:auto;display:flex;flex-direction:column;gap:22px;padding:10px 10px 14px;
  scrollbar-width:thin;scrollbar-color:${ACCENT} transparent;}

.gb-row{display:flex;align-items:flex-start;gap:26px;}
.gb-row.rev{flex-direction:row-reverse;}

.gb-avatar{flex:0 0 64px;width:64px;height:64px;padding:4px;margin:4px;
  box-shadow:0 -4px 0 0 ${DARK},0 4px 0 0 ${DARK},-4px 0 0 0 ${DARK},4px 0 0 0 ${DARK};}
.gb-bob{animation:gbBob 1.2s steps(1,end) infinite;}
@keyframes gbBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-.5px)}}

.gb-bubble{position:relative;flex:1;min-width:0;margin:4px;padding:10px 14px 8px;background:#ffffff;color:${INK};text-align:left;
  box-shadow:0 -4px 0 0 ${DARK},0 4px 0 0 ${DARK},-4px 0 0 0 ${DARK},4px 0 0 0 ${DARK};}
.gb-tail{position:absolute;top:14px;left:-20px;width:20px;height:28px;z-index:1;display:block;}
.gb-row.rev .gb-tail{left:auto;right:-20px;transform:scaleX(-1);}

.gb-name{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${ACCENT};
  padding-bottom:6px;margin-bottom:8px;border-bottom:2px dashed rgba(74,144,217,.4);overflow-wrap:anywhere;}
.gb-msg{font-size:14px;line-height:1.55;color:${BODY};white-space:pre-wrap;overflow-wrap:anywhere;}
.gb-foot{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:11px;color:${MUTED};}
.gb-next{color:${ACCENT};animation:gbBlink 1s steps(1,end) infinite;}
@keyframes gbBlink{0%{opacity:1}50%{opacity:0}100%{opacity:1}}

@media (prefers-reduced-motion:reduce){.gb-bob,.gb-next{animation:none;}}
`

export default function GuestbookWall({ wishes }: { wishes: Wish[] }) {
  const count = wishes.length

  return (
    <div className="gb-wall">
      <style>{css}</style>

      <div className="gb-head">
        <span style={{ color: '#f59ab9' }}>♥</span>
        <span>
          {count} {count === 1 ? 'message' : 'messages'} on the wall
        </span>
        <span style={{ color: '#f59ab9' }}>♥</span>
      </div>

      <div className="gb-scroll">
        {count === 0 ? (
          <DialogRow
            name="Guestbook"
            message="No messages yet. Be the first to leave one for the couple!"
            index={0}
          />
        ) : (
          wishes.map((wish, i) => (
            <ScrollReveal key={wish.id} delay={Math.min(i * 60, 400)}>
              <DialogRow
                name={wish.guest.name}
                message={wish.message}
                date={formatDate(wish.createdAt)}
                index={i}
              />
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  )
}