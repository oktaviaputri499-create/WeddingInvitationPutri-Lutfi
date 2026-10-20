import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'
import WishForm from './WishForm'
import InvitationIntro from './InvitationIntro'
import ScrollReveal from './ScrollReveal'
import GuestQrCode from './GuestQrCode'
import AnimatedText from './AnimatedText'
import GrowLine from './GrowLine'
import LuxBackground from './LuxBackground'
import { MapPin, Calendar, Clock, Gift, CreditCard, Leaf, CalendarPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const GOLD = '#a2824a'
const IVORY = '#f3ece0'

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0.14 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`

// Deterministic torn-paper outline (same result on server and client)
function tornPath(seed: number) {
  let s = seed * 9301 + 49297
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const N = 28
  const M = 16
  const pts: string[] = []
  for (let i = 0; i <= N; i++) pts.push(`${((i / N) * 100).toFixed(2)}% ${(rnd() * 5).toFixed(1)}px`)
  for (let i = 1; i <= M; i++) pts.push(`calc(100% - ${(rnd() * 5).toFixed(1)}px) ${((i / M) * 100).toFixed(2)}%`)
  for (let i = N - 1; i >= 0; i--) pts.push(`${((i / N) * 100).toFixed(2)}% calc(100% - ${(rnd() * 5).toFixed(1)}px)`)
  for (let i = M - 1; i >= 1; i--) pts.push(`${(rnd() * 5).toFixed(1)}px ${((i / M) * 100).toFixed(2)}%`)
  return `polygon(${pts.join(',')})`
}

function PaperCard({ seed, children }: { seed: number; children: React.ReactNode }) {
  return (
    <div style={{ filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.5))' }}>
      <div
        className="relative w-full"
        style={{
          clipPath: tornPath(seed),
          backgroundColor: '#f4eee3',
          backgroundImage: `${GRAIN}, linear-gradient(160deg,#fbf7ef 0%,#efe6d4 100%)`,
          color: '#3b2f27',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative px-8 pt-10 pb-6">
      <h2 className="font-script text-5xl leading-tight" style={{ color: GOLD }}>
        {children}
      </h2>
    </div>
  )
}

function MiniSeal({ initials }: { initials: string }) {
  return (
    <div
      className="mx-auto w-14 h-14 rounded-full flex items-center justify-center font-lux italic"
      style={{
        background: 'radial-gradient(circle at 35% 28%,#f6e8c4,#d4b26e 55%,#a6823f)',
        boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.18), 0 4px 10px rgba(80,55,20,.35)',
        color: '#7a5a22',
        fontSize: 18,
      }}
    >
      {initials}
    </div>
  )
}

export default async function InvitationPage({ params }: { params: { token: string } }) {
  const guest = await prisma.guest.findUnique({
    where: { token: params.token },
    include: { rsvp: true }
  })

  if (!guest) {
    notFound()
  }

  const wishes = await prisma.wish.findMany({
    orderBy: { createdAt: 'desc' },
    include: { guest: true }
  })
  const settings = await prisma.eventSettings.findUnique({ where: { id: 'main' } })

  // Timing for the name animation in the hero
  const groomFirst = settings?.groomName?.split(' ')[0] || ''
  const brideFirst = settings?.brideName?.split(' ')[0] || ''
  const letterStep = 0.08
  const groomDelay = 0.6
  const ampDelay = groomDelay + groomFirst.length * letterStep
  const brideDelay = ampDelay + letterStep * 2
  const initials = `${groomFirst.charAt(0)}&${brideFirst.charAt(0)}`.toUpperCase()

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'DTSTART:20270707T010000Z',
    'DTEND:20270707T030000Z',
    `SUMMARY:Akad Nikah ${settings?.groomName} & ${settings?.brideName}`,
    `LOCATION:${settings?.weddingLocation}`,
    `DESCRIPTION:Akad Nikah ${settings?.groomName} & ${settings?.brideName}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.weddingLocation || '')}`

  return (
    <InvitationIntro
      guestName={guest.name}
      groomName={groomFirst || undefined}
      brideName={brideFirst || undefined}
    >
      <div className="max-w-md mx-auto min-h-screen overflow-hidden relative">
        {/* Animated black & white background.
            To use a real video instead: <LuxBackground videoSrc="/bg-flowers.mp4" /> */}
        <LuxBackground />

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center overflow-hidden">
            {/* Thin gold double frame */}
            <div
              className="absolute pointer-events-none"
              style={{ inset: 14, border: '1px solid rgba(212,178,110,0.4)' }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ inset: 20, border: '1px solid rgba(212,178,110,0.16)' }}
            />

            <div
              className="relative w-full flex flex-col items-center"
              style={{ color: IVORY, textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
            >
              <p className="font-lux uppercase text-xs tracking-[0.5em] mb-5" style={{ color: '#cdbfa8' }}>
                The Wedding Of
              </p>

              {/* Groom & Bride on one line (wraps neatly if the names are long) */}
              <h1
                className="font-script"
                style={{ fontSize: 'clamp(2.9rem, 13.5vw, 4.4rem)', lineHeight: 1.15 }}
              >
                <AnimatedText text={groomFirst} startDelay={groomDelay} step={letterStep} />
                {' '}
                <span style={{ fontSize: '0.72em', color: '#d4b26e' }}>
                  <AnimatedText text="&" startDelay={ampDelay} step={letterStep} />
                </span>
                {' '}
                <AnimatedText text={brideFirst} startDelay={brideDelay} step={letterStep} />
              </h1>

              <div
                className="mx-auto mt-8 mb-7 h-px w-28"
                style={{ background: 'linear-gradient(90deg,transparent,#d4b26e,transparent)' }}
              />

              <p
                className="font-lux uppercase"
                style={{ fontSize: 'clamp(1.6rem, 7.5vw, 2.2rem)', letterSpacing: '0.14em' }}
              >
                You&apos;re Invited
              </p>

              <p className="font-lux italic text-sm mt-8 mb-1" style={{ color: '#cdbfa8' }}>
                To Our Beloved Guest,
              </p>
              <p className="font-script" style={{ fontSize: '2.6rem', color: '#e6d3a6', lineHeight: 1.2 }}>
                <AnimatedText text={guest.name} startDelay={1.8} step={0.05} />
              </p>
              <p className="font-lux italic text-sm mt-4 px-2" style={{ color: '#d9cdb8' }}>
                {settings?.welcomeMessage}
              </p>
              <Leaf className="leaf-sway mx-auto mt-4" size={20} strokeWidth={1.5} fill="none" color="#d4b26e" />
            </div>
          </section>

          {/* Couple Section */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <PaperCard seed={3}>
                <SectionTitle>
                  <AnimatedText text="The Groom & The Bride" startDelay={0.2} step={0.06} />
                </SectionTitle>

                <GrowLine />

                <div className="relative px-8 py-8">
                  <h3 className="font-lux text-3xl font-semibold mb-3" style={{ color: '#3b2f27' }}>
                    <AnimatedText text={settings?.groomName || ''} startDelay={0.3} step={0.05} />
                  </h3>
                  <p className="font-lux text-sm text-stone-700 mb-1">Putra dari:</p>
                  <p className="font-lux text-sm text-stone-700">{settings?.groomParents}</p>
                </div>

                <div className="relative text-2xl font-script" style={{ color: GOLD }}>&</div>

                <div className="relative px-8 py-8 pb-10">
                  <h3 className="font-lux text-3xl font-semibold mb-3" style={{ color: '#3b2f27' }}>
                    <AnimatedText text={settings?.brideName || ''} startDelay={0.3} step={0.05} />
                  </h3>
                  <p className="font-lux text-sm text-stone-700 mb-1">Putri dari:</p>
                  <p className="font-lux text-sm text-stone-700">{settings?.brideParents}</p>
                </div>
              </PaperCard>
            </ScrollReveal>
          </section>

          {/* Event Details */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <PaperCard seed={7}>
                <div className="pt-10">
                  <MiniSeal initials={initials} />
                </div>
                <div className="relative px-8 pt-4 pb-6">
                  <h2 className="font-script text-5xl leading-tight" style={{ color: GOLD }}>
                    <AnimatedText text="Wedding Event" startDelay={0.2} step={0.06} />
                  </h2>
                </div>

                <GrowLine />

                <div className="relative px-8 py-8 pb-10">
                  <h3 className="font-lux text-2xl mb-4 text-center" style={{ color: '#3b2f27' }}>
                    <AnimatedText text="Akad Nikah" startDelay={0.3} step={0.06} />
                  </h3>

                  <div className="font-lux inline-flex flex-col items-start gap-2 text-base mb-6" style={{ color: '#3b2f27' }}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="shrink-0" style={{ color: GOLD }} />
                      <span>{settings?.weddingDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0" style={{ color: GOLD }} />
                      <span>{settings?.weddingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="shrink-0" style={{ color: GOLD }} />
                      <span>{settings?.weddingLocation}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-dark-brown text-white text-sm rounded-full hover:bg-gold transition"
                    >
                      <MapPin size={16} />
                      Buka Google Maps
                    </a>
                    <a
                      href={icsHref}
                      download="Akad-Nikah.ics"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 border border-dark-brown text-dark-brown text-sm rounded-full hover:bg-dark-brown hover:text-white transition"
                    >
                      <CalendarPlus size={16} />
                      Tambah ke Kalender
                    </a>
                  </div>
                </div>
              </PaperCard>
            </ScrollReveal>
          </section>

          {/* Wedding Gift Section */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <PaperCard seed={11}>
                <SectionTitle>
                  <AnimatedText text="Gift & Support" startDelay={0.2} step={0.06} />
                </SectionTitle>

                <GrowLine />

                <div className="relative px-8 py-8 pb-10">
                  <div className="flex justify-center mb-4">
                    <Gift size={32} className="float-soft" style={{ color: GOLD }} />
                  </div>

                  <p className="font-lux text-base text-stone-700 mb-8 leading-relaxed">
                    {settings?.giftMessage}
                  </p>

                  <div className="flex flex-col items-center justify-center text-sm border-t border-stone-400/40 pt-6">
                    <div className="flex items-center gap-2 font-bold mb-2" style={{ color: '#3b2f27' }}>
                      <CreditCard size={18} style={{ color: GOLD }} />
                      <span>{settings?.bank1Name}</span>
                    </div>
                    <p className="text-2xl font-mono tracking-widest mb-1" style={{ color: GOLD }}>{settings?.bank1Number}</p>
                    <p className="text-stone-600">{settings?.bank1Holder}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-sm border-t border-stone-400/40 pt-6 mt-6">
                    <div className="flex items-center gap-2 font-bold mb-2" style={{ color: '#3b2f27' }}>
                      <CreditCard size={18} style={{ color: GOLD }} />
                      <span>{settings?.bank2Name}</span>
                    </div>
                    <p className="text-2xl font-mono tracking-widest mb-1" style={{ color: GOLD }}>{settings?.bank2Number}</p>
                    <p className="text-stone-600">{settings?.bank2Holder}</p>
                  </div>
                </div>
              </PaperCard>
            </ScrollReveal>
          </section>

          {/* RSVP */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <PaperCard seed={5}>
                <SectionTitle>
                  <AnimatedText text="RSVP" startDelay={0.2} step={0.1} />
                </SectionTitle>

                <GrowLine />

                <div className="relative px-8 py-8 pb-10">
                  <RsvpForm token={guest.token} initialRsvp={guest.rsvp} guestName={guest.name} />

                  {/* QR code entry pass: only shown after the guest confirms attendance */}
                  {guest.rsvp?.status === 'attending' && (
                    <div className="mt-8 pt-8 border-t border-stone-400/40">
                      <GuestQrCode token={guest.token} guestName={guest.name} />
                    </div>
                  )}
                </div>
              </PaperCard>
            </ScrollReveal>
          </section>

          {/* Wishes */}
          <section className="py-12 px-6">
            <ScrollReveal>
              <PaperCard seed={9}>
                <div className="text-center">
                  <SectionTitle>
                    <AnimatedText text="Ucapan & Doa" startDelay={0.2} step={0.06} />
                  </SectionTitle>
                </div>

                <GrowLine />

                <div className="relative px-8 py-8 pb-10">
                  <WishForm token={guest.token} guestName={guest.name} />
                </div>
              </PaperCard>
            </ScrollReveal>

            <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {wishes.map((wish, i) => (
                <ScrollReveal key={wish.id} delay={Math.min(i * 60, 400)}>
                  <div
                    className="p-4 rounded-sm shadow-lg"
                    style={{ backgroundColor: 'rgba(244,238,227,0.96)', color: '#3b2f27' }}
                  >
                    <p className="font-lux font-semibold text-base">{wish.guest.name}</p>
                    <p className="font-lux text-base mt-2 text-stone-700">{wish.message}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <footer className="py-8 text-center text-xs bg-black/60 backdrop-blur-md text-stone-300">
            <p className="font-lux tracking-widest">
              &copy; 2026 {settings?.groomName?.split(' ')[0]} & {settings?.brideName?.split(' ')[0]}. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </InvitationIntro>
  )
}