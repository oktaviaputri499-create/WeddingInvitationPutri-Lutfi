'use client'

import { useState, useEffect } from 'react'

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
  children: React.ReactNode
}) {
  const [stage, setStage] = useState<'cover' | 'opening' | 'revealed'>('cover')
  const [panelsOpen, setPanelsOpen] = useState(false)

  const handleOpen = () => {
    setStage('opening')

    // Panels mount already "closed" (in place, cream colored, blending with
    // the cover) then on the next frame slide apart — a single motion, no flash.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelsOpen(true))
    })

    setTimeout(() => setStage('revealed'), 1500)
  }

  if (stage === 'revealed') {
    return <RevealedContent>{children}</RevealedContent>
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-cream flex items-center justify-center">
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

      {/* Cream overlay to keep it subtle and match original look */}
      <div className="absolute inset-0 bg-cream/70" />

      {/* Falling petals */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute block w-2 h-2 rounded-full bg-gold/60"
            style={{
              left: `${(i * 7) % 100}%`,
              animation: `petal-fall ${5 + (i % 5)}s linear infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Cover content - fades out as soon as opening starts */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-8 transition-opacity duration-500 ${
          stage === 'opening' ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-fade-in-up'
        }`}
      >
        <p className="text-sm tracking-[0.3em] uppercase mb-4 text-dark-brown/70 font-medium">
          We invite you to The Wedding of
        </p>
        <h1
          className="text-5xl md:text-6xl text-gold mb-10"
          style={{ fontFamily: "'Edwardian Script ITC', 'Baskerville', cursive" }}
        >
          Lutfi <span className="text-3xl md:text-4xl text-gold/80">&</span> Putri
        </h1>
        <button
          onClick={handleOpen}
          className="px-6 py-3 rounded-full bg-dark-brown text-white text-sm tracking-wide hover:bg-gold transition"
        >
          Open the Invitation
        </button>
        <p className="mt-6 text-xs text-stone-500 italic">For {guestName}</p>
      </div>

      {/* Curtain panels - ONE motion only: mount closed (blended with cover), then slide apart */}
      {stage === 'opening' && (
        <>
          <div
            className={`absolute inset-y-0 left-0 w-1/2 bg-cream transition-transform duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] z-20 ${
              panelsOpen ? '-translate-x-full' : 'translate-x-0'
            }`}
          />
          <div
            className={`absolute inset-y-0 right-0 w-1/2 bg-cream transition-transform duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] z-20 ${
              panelsOpen ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
        </>
      )}
    </div>
  )
}