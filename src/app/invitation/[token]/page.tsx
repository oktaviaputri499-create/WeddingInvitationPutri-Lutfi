import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Cinzel } from 'next/font/google'
import RsvpForm from './RsvpForm'
import WishForm from './WishForm'
import InvitationIntro from './InvitationIntro'
import OurStoryButton from './OurStoryButton'
import ScrollReveal from './ScrollReveal'
import GuestQrCode from './GuestQrCode'
import AnimatedText from './AnimatedText'
import LuxBackground from './LuxBackground'
import { getTexts } from '@/lib/siteTexts'
import { MapPin, Calendar, Clock, Gift, CreditCard, CalendarPlus, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Font for the groom and bride names
const cinzel = Cinzel({ subsets: ['latin'], weight: ['500'] })

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

// Turns the admin's date + time (WIB) into an .ics timestamp (UTC)
function icsStamp(date: string, time: string, fallback: string) {
  const d = new Date(`${date}T${time}:00+07:00`)
  const valid = !isNaN(d.getTime())
  return (valid ? d : new Date(fallback)).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
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

  // All editable texts. A text left empty in the admin stays empty and is not shown.
  const t = getTexts(settings?.texts)

  // Timing for the name animation in the hero
  const groomFirst = settings?.groomName?.split(' ')[0] || ''
  const brideFirst = settings?.brideName?.split(' ')[0] || ''
  const letterStep = 0.05
  const groomDelay = 0.4
  const ampDelay = groomDelay + groomFirst.length * letterStep
  const brideDelay = ampDelay + letterStep * 2
  // The tagline fades in once both names have been written
  const taglineDelay = brideDelay + brideFirst.length * letterStep + 0.2

  // The heart icon stays attached to the last word of the tagline
  const tagWords = t.heroTagline.split(/\s+/).filter(Boolean)
  const tagLast = tagWords.pop() || ''
  const tagHead = tagWords.join(' ')

  const footerText = t.footerText.replace('{groom}', groomFirst).replace('{bride}', brideFirst)

  const eventLabel = t.eventName || 'Wedding'
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${icsStamp(t.calDate, t.calStart, '2027-03-07T08:00:00+07:00')}`,
    `DTEND:${icsStamp(t.calDate, t.calEnd, '2027-03-07T10:00:00+07:00')}`,
    `SUMMARY:${eventLabel} ${settings?.groomName} & ${settings?.brideName}`,
    `LOCATION:${settings?.weddingLocation}`,
    `DESCRIPTION:${eventLabel} ${settings?.groomName} & ${settings?.brideName}`,
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
      envTexts={{
        tapHint: t.envTapHint,
        dear: t.envDear,
        invited: t.envInvited,
        message: t.envMessage,
      }}
    >
      <div className="max-w-md mx-auto min-h-screen overflow-hidden relative">
        <LuxBackground />

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center overflow-hidden">
            <style>{`@keyframes heroFade{from{opacity:0}to{opacity:1}}`}</style>

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
              {t.heroEyebrow && (
                <p className="font-lux uppercase text-xs tracking-[0.5em] mb-5" style={{ color: MUTED }}>
                  <AnimatedText text={t.heroEyebrow} startDelay={0.1} step={0.03} />
                </p>
              )}

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

              {t.heroTagline && (
                <p
                  className="font-lux italic text-sm mt-6 px-2"
                  style={{ color: BODY, animation: `heroFade 1.4s ease-out ${taglineDelay}s both` }}
                >
                  {tagHead}{tagHead ? ' ' : ''}
                  <span className="whitespace-nowrap">
                    {tagLast}
                    <Heart
                      size={14}
                      strokeWidth={1.5}
                      fill="none"
                      color={GOLD}
                      className="inline-block ml-1.5 align-middle"
                    />
                  </span>
                </p>
              )}

              {/* Our Story button */}
              <OurStoryButton />
            </div>
          </section>

          {/* Couple Section */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                {t.coupleTitle && (
                  <SectionTitle>
                    <AnimatedText text={t.coupleTitle} startDelay={0.1} step={0.035} />
                  </SectionTitle>
                )}

                <GoldLine />

                <div className="relative px-8 py-8">
                  <h3
                    className={`${cinzel.className} text-2xl font-medium tracking-[0.08em] mb-3`}
                    style={{ color: IVORY }}
                  >
                    <AnimatedText text={settings?.groomName || ''} startDelay={0.2} step={0.03} />
                  </h3>
                  {t.groomLabel && (
                    <p className="font-lux italic text-sm mb-1" style={{ color: MUTED }}>
                      <AnimatedText text={t.groomLabel} startDelay={0.5} step={0.025} />
                    </p>
                  )}
                  <p className="font-lux text-sm" style={{ color: BODY }}>
                    <AnimatedText text={settings?.groomParents || ''} startDelay={0.8} step={0.02} />
                  </p>
                </div>

                <div className="relative text-3xl font-script" style={{ color: GOLD }}>
                  <AnimatedText text="&" startDelay={0.2} step={0.03} />
                </div>

                <div className="relative px-8 py-8 pb-12">
                  <h3
                    className={`${cinzel.className} text-2xl font-medium tracking-[0.08em] mb-3`}
                    style={{ color: IVORY }}
                  >
                    <AnimatedText text={settings?.brideName || ''} startDelay={0.2} step={0.03} />
                  </h3>
                  {t.brideLabel && (
                    <p className="font-lux italic text-sm mb-1" style={{ color: MUTED }}>
                      <AnimatedText text={t.brideLabel} startDelay={0.5} step={0.025} />
                    </p>
                  )}
                  <p className="font-lux text-sm" style={{ color: BODY }}>
                    <AnimatedText text={settings?.brideParents || ''} startDelay={0.8} step={0.02} />
                  </p>
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* Event Details */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                {t.eventTitle && (
                  <SectionTitle>
                    <AnimatedText text={t.eventTitle} startDelay={0.1} step={0.035} />
                  </SectionTitle>
                )}

                <GoldLine />

                <div className="relative px-8 py-8 pb-12">
                  {t.eventName && (
                    <h3 className="font-lux uppercase text-2xl mb-5 text-center" style={{ color: IVORY, letterSpacing: '0.14em' }}>
                      <AnimatedText text={t.eventName} startDelay={0.2} step={0.035} />
                    </h3>
                  )}

                  <div className="font-lux inline-flex flex-col items-start gap-2 text-base mb-7 text-left" style={{ color: BODY }}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="shrink-0" style={{ color: GOLD }} />
                      <span>
                        <AnimatedText text={settings?.weddingDate || ''} startDelay={0.5} step={0.025} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0" style={{ color: GOLD }} />
                      <span>
                        <AnimatedText text={settings?.weddingTime || ''} startDelay={0.8} step={0.025} />
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="shrink-0 mt-1" style={{ color: GOLD }} />
                      <span>
                        <AnimatedText text={settings?.weddingLocation || ''} startDelay={1.1} step={0.02} />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {t.mapsButton && (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-lux inline-flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-full transition hover:opacity-90"
                        style={{ backgroundColor: GOLD, color: '#1b1510', textShadow: 'none' }}
                      >
                        <MapPin size={16} />
                        <AnimatedText text={t.mapsButton} startDelay={1.5} step={0.025} />
                      </a>
                    )}
                    {t.calendarButton && (
                      <a
                        href={icsHref}
                        download="Akad-Nikah.ics"
                        className="font-lux inline-flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-full border transition hover:bg-[#d4b26e] hover:text-[#1b1510]"
                        style={{ borderColor: GOLD, color: GOLD, textShadow: 'none' }}
                      >
                        <CalendarPlus size={16} />
                        <AnimatedText text={t.calendarButton} startDelay={1.9} step={0.025} />
                      </a>
                    )}
                  </div>
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* Wedding Gift Section */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                {t.giftTitle && (
                  <SectionTitle>
                    <AnimatedText text={t.giftTitle} startDelay={0.1} step={0.035} />
                  </SectionTitle>
                )}

                <GoldLine />

                <div className="relative px-8 py-8 pb-12">
                  <div className="flex justify-center mb-4">
                    <Gift size={32} className="float-soft" style={{ color: GOLD }} />
                  </div>

                  <p className="font-lux italic text-base mb-8 leading-relaxed" style={{ color: BODY }}>
                    <AnimatedText text={settings?.giftMessage || ''} startDelay={0.4} step={0.012} />
                  </p>

                  <div
                    className="flex flex-col items-center justify-center text-sm pt-6"
                    style={{ borderTop: `1px solid ${LINE}` }}
                  >
                    <div className="font-lux flex items-center gap-2 font-bold mb-2" style={{ color: IVORY }}>
                      <CreditCard size={18} style={{ color: GOLD }} />
                      <span>
                        <AnimatedText text={settings?.bank1Name || ''} startDelay={1.5} step={0.03} />
                      </span>
                    </div>
                    <p className="text-2xl font-mono tracking-widest mb-1" style={{ color: GOLD }}>
                      <AnimatedText text={settings?.bank1Number || ''} startDelay={1.8} step={0.03} />
                    </p>
                    <p className="font-lux" style={{ color: MUTED }}>
                      <AnimatedText text={settings?.bank1Holder || ''} startDelay={2.2} step={0.025} />
                    </p>
                  </div>

                  <div
                    className="flex flex-col items-center justify-center text-sm pt-6 mt-6"
                    style={{ borderTop: `1px solid ${LINE}` }}
                  >
                    <div className="font-lux flex items-center gap-2 font-bold mb-2" style={{ color: IVORY }}>
                      <CreditCard size={18} style={{ color: GOLD }} />
                      <span>
                        <AnimatedText text={settings?.bank2Name || ''} startDelay={2.6} step={0.03} />
                      </span>
                    </div>
                    <p className="text-2xl font-mono tracking-widest mb-1" style={{ color: GOLD }}>
                      <AnimatedText text={settings?.bank2Number || ''} startDelay={2.9} step={0.03} />
                    </p>
                    <p className="font-lux" style={{ color: MUTED }}>
                      <AnimatedText text={settings?.bank2Holder || ''} startDelay={3.3} step={0.025} />
                    </p>
                  </div>
                </div>
              </LuxPanel>
            </ScrollReveal>
          </section>

          {/* RSVP */}
          <section className="py-12 px-6 text-center">
            <ScrollReveal>
              <LuxPanel>
                {t.rsvpTitle && (
                  <SectionTitle>
                    <AnimatedText text={t.rsvpTitle} startDelay={0.1} step={0.06} />
                  </SectionTitle>
                )}

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
                {t.wishesTitle && (
                  <div className="text-center">
                    <SectionTitle>
                      <AnimatedText text={t.wishesTitle} startDelay={0.1} step={0.035} />
                    </SectionTitle>
                  </div>
                )}

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
                    <p className="font-lux font-semibold text-base" style={{ color: TITLE }}>
                      <AnimatedText text={wish.guest.name} startDelay={0.1} step={0.025} />
                    </p>
                    <p className="font-lux italic text-base mt-2" style={{ color: BODY }}>
                      <AnimatedText text={wish.message} startDelay={0.3} step={0.01} />
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {footerText.trim() && (
            <footer className="py-8 text-center text-xs bg-black/60 backdrop-blur-md text-stone-300">
              <p className="font-lux tracking-widest">
                <AnimatedText text={footerText} startDelay={0.1} step={0.02} />
              </p>
            </footer>
          )}
        </div>
      </div>
    </InvitationIntro>
  )
}