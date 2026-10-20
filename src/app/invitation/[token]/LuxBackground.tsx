'use client'

import { useEffect, useRef } from 'react'

const LEAF = 'M0 0 C6 -9 20 -9 28 0 C20 9 6 9 0 0 Z'

// One botanical branch: a curved stem with outlined leaves
const BRANCH = (() => {
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
  const leaves = Array.from({ length: 11 }, (_, i) => {
    const t = 0.08 + i * 0.08
    const [x, y] = at(t)
    const [dx, dy] = dir(t)
    const side = i % 2 === 0 ? 1 : -1
    const a = (Math.atan2(dy, dx) * 180) / Math.PI + side * 50
    return { x, y, a, s: 1.35 - t * 0.7 }
  })
  const tip = at(1)
  const tipAngle = (Math.atan2(dir(1)[1], dir(1)[0]) * 180) / Math.PI
  return { leaves, tip, tipAngle }
})()

function Branch({ pos, delay }: { pos: string; delay: number }) {
  return (
    <div className={`lux-br ${pos}`}>
      <svg viewBox="0 0 200 300" className="lux-sway" aria-hidden style={{ animationDelay: `${delay}s` }}>
        <g fill="none" stroke="rgba(238,228,210,0.55)" strokeWidth="1" strokeLinecap="round">
          <path
            d="M20 290 C30 190 70 110 130 20"
            strokeWidth="1.6"
            pathLength={1}
            className="lux-draw"
            style={{ animationDelay: `${delay}s` }}
          />
          {BRANCH.leaves.map((l, i) => (
            <path
              key={i}
              d={LEAF}
              className="lux-leaf"
              style={{ animationDelay: `${delay + 1.2 + i * 0.28}s` }}
              transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`}
            />
          ))}
          <path
            d={LEAF}
            className="lux-leaf"
            style={{ animationDelay: `${delay + 4.4}s` }}
            transform={`translate(${BRANCH.tip[0]} ${BRANCH.tip[1]}) rotate(${BRANCH.tipAngle}) scale(1.3)`}
          />
        </g>
      </svg>
    </div>
  )
}

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Pinyon+Script&display=swap');

.font-script{font-family:'Pinyon Script','Edwardian Script ITC','Lucida Calligraphy',cursive;font-weight:400;}
.font-lux{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;}

.lux-bg{position:fixed;inset:0;z-index:0;overflow:hidden;
  background:radial-gradient(ellipse at 50% 28%,#26231f 0%,#0e0d0b 68%,#050505 100%);}

.lux-leak{position:absolute;width:90vmax;height:90vmax;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(214,190,150,.17) 0%,rgba(214,190,150,0) 62%);}
.lux-leak.a{left:-35vmax;top:-30vmax;animation:leakA 26s ease-in-out infinite alternate;}
.lux-leak.b{right:-40vmax;bottom:-35vmax;animation:leakB 32s ease-in-out infinite alternate;}
@keyframes leakA{from{transform:translate(0,0)}to{transform:translate(22vw,16vh)}}
@keyframes leakB{from{transform:translate(0,0)}to{transform:translate(-20vw,-14vh)}}

.lux-br{position:absolute;width:clamp(190px,50vmin,430px);opacity:.6;pointer-events:none;}
.lux-br svg{display:block;width:100%;height:auto;overflow:visible;}
.br-bl{left:-4vmin;bottom:-5vmin;}
.br-br{right:-4vmin;bottom:-5vmin;transform:scaleX(-1);}
.br-tl{left:-4vmin;top:-5vmin;transform:scaleY(-1);}
.br-tr{right:-4vmin;top:-5vmin;transform:scale(-1,-1);}

.lux-sway{transform-origin:10% 97%;animation:luxSway 10s ease-in-out infinite alternate;}
@keyframes luxSway{from{transform:rotate(-2.2deg)}to{transform:rotate(2.4deg)}}
.lux-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:luxDraw 5s ease-out forwards;}
@keyframes luxDraw{to{stroke-dashoffset:0}}
.lux-leaf{opacity:0;animation:luxLeaf 1.6s ease-out forwards;}
@keyframes luxLeaf{to{opacity:1}}

.lux-vignette{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 35%,rgba(0,0,0,.6) 100%);}
.lux-grain{position:absolute;inset:0;pointer-events:none;opacity:.07;background-image:${GRAIN};mix-blend-mode:screen;}
.lux-canvas{position:absolute;inset:0;pointer-events:none;}
.lux-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.05) brightness(.7);opacity:.55;}

@media (prefers-reduced-motion:reduce){
  .lux-sway,.lux-leak{animation:none;}
}
`

type Petal = {
  x: number
  y: number
  s: number
  vy: number
  vx: number
  rot: number
  vr: number
  flip: number
  vf: number
  a: number
  ph: number
  amp: number
}

export default function LuxBackground({ videoSrc }: { videoSrc?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    let t = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const makePetal = (init: boolean): Petal => {
      const depth = Math.random()
      const s = 5 + depth * 13
      return {
        x: Math.random() * w,
        y: init ? Math.random() * h : -s * 2,
        s,
        vy: 14 + depth * 34,
        vx: (Math.random() - 0.5) * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.9,
        flip: Math.random() * Math.PI * 2,
        vf: 0.8 + Math.random() * 1.6,
        a: 0.16 + depth * 0.5,
        ph: Math.random() * Math.PI * 2,
        amp: 10 + Math.random() * 30,
      }
    }

    const petals: Petal[] = Array.from({ length: w < 600 ? 22 : 38 }, () => makePetal(true))
    const dust = Array.from({ length: w < 600 ? 28 : 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.3,
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.4,
    }))

    const drawPetal = (p: Petal) => {
      const px = p.x + Math.sin(t * 0.6 + p.ph) * p.amp
      ctx.save()
      ctx.translate(px, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.max(0.15, Math.abs(Math.cos(p.flip))))
      ctx.beginPath()
      ctx.moveTo(0, -p.s)
      ctx.bezierCurveTo(p.s * 0.95, -p.s * 0.6, p.s * 0.95, p.s * 0.5, 0, p.s)
      ctx.bezierCurveTo(-p.s * 0.95, p.s * 0.5, -p.s * 0.95, -p.s * 0.6, 0, -p.s)
      ctx.fillStyle = `rgba(245,240,232,${p.a})`
      ctx.fill()
      ctx.restore()
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05)
      last = now
      t += dt
      ctx.clearRect(0, 0, w, h)

      for (const d of dust) {
        const a = ((Math.sin(t * d.sp + d.ph) + 1) / 2) * 0.55
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,225,195,${a})`
        ctx.fill()
      }

      petals.forEach((p, i) => {
        p.y += p.vy * dt
        p.x += p.vx * dt
        p.rot += p.vr * dt
        p.flip += p.vf * dt
        if (p.y > h + p.s * 2) petals[i] = makePetal(false)
        drawPetal(p)
      })

      raf = requestAnimationFrame(frame)
    }

    if (reduce) {
      petals.forEach(drawPetal)
    } else {
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="lux-bg" aria-hidden>
      <style>{css}</style>

      {videoSrc && (
        <video className="lux-video" autoPlay loop muted playsInline>
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div className="lux-leak a" />
      <div className="lux-leak b" />

      <Branch pos="br-bl" delay={0.3} />
      <Branch pos="br-br" delay={1.2} />
      <Branch pos="br-tl" delay={2.1} />
      <Branch pos="br-tr" delay={0.8} />

      <canvas ref={canvasRef} className="lux-canvas" />
      <div className="lux-vignette" />
      <div className="lux-grain" />
    </div>
  )
}