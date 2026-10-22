import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'
import WishForm from './WishForm'
import InvitationIntro from './InvitationIntro'
import ScrollReveal from './ScrollReveal'
import GuestQrCode from './GuestQrCode'
import AnimatedText from './AnimatedText'
import LuxBackground from './LuxBackground'
import { MapPin, Calendar, Clock, Gift, CreditCard, CalendarPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const GOLD = '#d4b26e'
const IVORY = '#f3ece0'
const TITLE = '#e6d3a6'
const MUTED = '#cdbfa8'
const BODY = '#d9cdb8'
const LINE = 'rgba(212,178,110,0.3)'

// Same look as the hero: thin gold double frame on a dark background
function LuxPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full"
      style={{
        color: IVORY,
        textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        backgroundColor: 'rgba(12,10,8,0.35)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{ inset: 0, border: '1px solid rgba(212,178,110,0.4)' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ inset: 6, border: '1px solid rgba(212,178,110,0.16)' }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

function GoldLine() {
  return (
    <div
      className="mx-auto h-px w-28"
      style={{ background: 'linear-gradient(90deg,transparent,#d4b26e,transparent)' }}
    />
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative px-8 pt-12 pb-6">
      <h2 className="font-script text-5xl leading-tight" style={{ color: TITLE }}>
        {children}
      </h2>
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
        <LuxBackground />

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center overflow-hidden">
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
              <p className="font-lux uppercase text-xs tracking-[0.5em] mb-5" style={{ color: MUTED }}>
                The Wedding Of
              </p>

              <h1
                className="font-script"
                style={{ fontSize: 'clamp(2.9rem, 13.5vw, 4.4rem)', lineHeight: 1.15 }}
              >
                <AnimatedText text={groomFirst} startDelay={groomDelay} step={letterStep} />
                {' '}
                <span style={{ fontSize: '0.72em', color: GOLD }}>
                  <AnimatedText text="&" startDelay={ampDelay} step={letterStep} />
                </span>
                {' '}
                <AnimatedText text={brideFirst} startDelay={brideDelay} step={letterStep} />
              </h1>

              <div
                className="mx-auto mt-8 h-px w-28"
                style={{ background: 'linear-gradient(90deg,transparent,#d4b26e,transparent)' }}
              />
            </div>
          </section>

          {/* Couple Section */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                <SectionTitle>
                  <AnimatedText text="The Groom & The Bride" startDelay={0.2} step={0.06} />
                </SectionTitle>

                <GoldLine />

                <div className="relative px-8 py-8">
                  <h3 className="font-lux text-3xl font-semibold mb-3" style={{ color: IVORY }}>
                    <AnimatedText text={settings?.groomName || ''} startDelay={0.3} step={0.05} />
                  </h3>
                  <p className="font-lux italic text-sm mb-1" style={{ color: MUTED }}>Putra dari:</p>
                  <p className="font-lux text-sm" style={{ color: BODY }}>{settings?.groomParents}</p>
                </div>

                <div className="relative text-3xl font-script" style={{ color: GOLD }}>&</div>

                <div className="relative px-8 py-8 pb-12">
                  <h3 className="font-lux text-3xl font-semibold mb-3" style={{ color: IVORY }}>
                    <AnimatedText text={settings?.brideName || ''} startDelay={0.3} step={0.05} />
                  </h3>
                  <p className="font-lux italic text-sm mb-1" style={{ color: MUTED }}>Putri dari:</p>
                  <p className="font-lux text-sm" style={{ color: BODY }}>{settings?.brideParents}</p>
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* Event Details */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                <SectionTitle>
                  <AnimatedText text="Wedding Event" startDelay={0.2} step={0.06} />
                </SectionTitle>

                <GoldLine />

                <div className="relative px-8 py-8 pb-12">
                  <h3 className="font-lux uppercase text-2xl mb-5 text-center" style={{ color: IVORY, letterSpacing: '0.14em' }}>
                    <AnimatedText text="Akad Nikah" startDelay={0.3} step={0.06} />
                  </h3>

                  <div className="font-lux inline-flex flex-col items-start gap-2 text-base mb-7" style={{ color: BODY }}>
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
                      className="font-lux inline-flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-full transition hover:opacity-90"
                      style={{ backgroundColor: GOLD, color: '#1b1510', textShadow: 'none' }}
                    >
                      <MapPin size={16} />
                      Buka Google Maps
                    </a>
                    <a
                      href={icsHref}
                      download="Akad-Nikah.ics"
                      className="font-lux inline-flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-full border transition hover:bg-[#d4b26e] hover:text-[#1b1510]"
                      style={{ borderColor: GOLD, color: GOLD, textShadow: 'none' }}
                    >
                      <CalendarPlus size={16} />
                      Tambah ke Kalender
                    </a>
                  </div>
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* Wedding Gift Section */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                <SectionTitle>
                  <AnimatedText text="Gift & Support" startDelay={0.2} step={0.06} />
                </SectionTitle>

                <GoldLine />

                <div className="relative px-8 py-8 pb-12">
                  <div className="flex justify-center mb-4">
                    <Gift size={32} className="float-soft" style={{ color: GOLD }} />
                  </div>

                  <p className="font-lux italic text-base mb-8 leading-relaxed" style={{ color: BODY }}>
                    {settings?.giftMessage}
                  </p>

                  <div
                    className="flex flex-col items-center justify-center text-sm pt-6"
                    style={{ borderTop: `1px solid ${LINE}` }}
                  >
                    <div className="font-lux flex items-center gap-2 font-bold mb-2" style={{ color: IVORY }}>
                      <CreditCard size={18} style={{ color: GOLD }} />
                      <span>{settings?.bank1Name}</span>
                    </div>
                    <p className="text-2xl font-mono tracking-widest mb-1" style={{ color: GOLD }}>{settings?.bank1Number}</p>
                    <p className="font-lux" style={{ color: MUTED }}>{settings?.bank1Holder}</p>
                  </div>

                  <div
                    className="flex flex-col items-center justify-center text-sm pt-6 mt-6"
                    style={{ borderTop: `1px solid ${LINE}` }}
                  >
                    <div className="font-lux flex items-center gap-2 font-bold mb-2" style={{ color: IVORY }}>
                      <CreditCard size={18} style={{ color: GOLD }} />
                      <span>{settings?.bank2Name}</span>
                    </div>
                    <p className="text-2xl font-mono tracking-widest mb-1" style={{ color: GOLD }}>{settings?.bank2Number}</p>
                    <p className="font-lux" style={{ color: MUTED }}>{settings?.bank2Holder}</p>
                  </div>
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* RSVP */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                <SectionTitle>
                  <AnimatedText text="RSVP" startDelay={0.2} step={0.1} />
                </SectionTitle>

                <GoldLine />

                <div className="relative px-8 py-8 pb-12">
                  <RsvpForm token={guest.token} initialRsvp={guest.rsvp} guestName={guest.name} />

                  {/* QR code entry pass: only shown after the guest confirms attendance */}
                  {guest.rsvp?.status === 'attending' && (
                    <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
                      <GuestQrCode token={guest.token} guestName={guest.name} />
                    </div>
                  )}
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* Wishes */}
          <section className="py-12 px-6">
            <ScrollReveal>
              <LuxPanel>
                <div className="text-center">
                  <SectionTitle>
                    <AnimatedText text="Ucapan & Doa" startDelay={0.2} step={0.06} />
                  </SectionTitle>
                </div>

                <GoldLine />

                <div className="relative px-8 py-8 pb-12">
                  <WishForm token={guest.token} guestName={guest.name} />
                </div>
              </LuxPanel>
            </ScrollReveal>

            <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {wishes.map((wish, i) => (
                <ScrollReveal key={wish.id} delay={Math.min(i * 60, 400)}>
                  <div
                    className="p-4 rounded-sm"
                    style={{
                      backgroundColor: 'rgba(12,10,8,0.45)',
                      border: '1px solid rgba(212,178,110,0.25)',
                      color: IVORY,
                    }}
                  >
                    <p className="font-lux font-semibold text-base" style={{ color: TITLE }}>{wish.guest.name}</p>
                    <p className="font-lux italic text-base mt-2" style={{ color: BODY }}>{wish.message}</p>
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