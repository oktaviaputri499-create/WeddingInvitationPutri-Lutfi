import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Cinzel, Cormorant_Garamond } from 'next/font/google'
import RsvpForm from './RsvpForm'
import WishForm from './WishForm'
import InvitationIntro from './InvitationIntro'
import OurStoryButton from './OurStoryButton'
import ScrollReveal from './ScrollReveal'
import GuestQrCode from './GuestQrCode'
import AnimatedText from './AnimatedText'
import LuxBackground from './LuxBackground'
import CopyButton from './CopyButton'
import GuestbookWall from './GuestbookWall'
import { getTexts } from '@/lib/siteTexts'
import { MapPin, Calendar, Clock, Gift, CreditCard, CalendarPlus, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Font for the groom and bride names (couple section)
const cinzel = Cinzel({ subsets: ['latin'], weight: ['500'] })

// Font for the hero names (same as the "You're Invited" title)
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400'], variable: '--font-cormorant' })

// ===== Soft blue palette =====
const ACCENT = '#4a90d9'   // main blue accent (icons, buttons, ampersand)
const INK = '#23446b'      // deep navy for names and strong text
const TITLE = '#2f5d8c'    // section titles
const MUTED = '#5f82a8'    // small labels
const BODY = '#35577f'     // body text
const LINE = 'rgba(74,144,217,0.3)'
const TEXT_GLOW = '0 1px 14px rgba(255,255,255,0.7)'

// Same look as the hero: thin blue double frame on a frosted white panel
function LuxPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full"
      style={{
        color: INK,
        textShadow: TEXT_GLOW,
        backgroundColor: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 8px 30px rgba(74,144,217,0.15)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{ inset: 0, border: '1px solid rgba(74,144,217,0.5)' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ inset: 6, border: '1px solid rgba(74,144,217,0.2)' }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

function BlueLine() {
  return (
    <div
      className="mx-auto h-px w-28"
      style={{ background: 'linear-gradient(90deg,transparent,#4a90d9,transparent)' }}
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

// ===== Pixel ornament for the top and bottom of the hero =====
// Drawn pixel by pixel: every character below is one square pixel.
// . = empty, P = pink, H = light pink, G = blue, g = pale blue, I = ice white, S = sparkle
const PX_COLORS: Record<string, string> = {
  P: '#f59ab9',
  H: '#ffd3e2',
  G: '#4a90d9',
  g: '#9cc3ea',
  I: '#e6f3ff',
  S: '#7fb2e5',
}

const PX_HEART = [
  '.......',
  '.HP.PP.',
  'PPPPPPP',
  'PPPPPPP',
  '.PPPPP.',
  '..PPP..',
  '...P...',
]

const PX_DIAMOND = [
  '.....',
  '..G..',
  '.GGG.',
  'GGIGG',
  '.GGG.',
  '..G..',
  '.....',
]

const PX_SPARKLE = [
  '...',
  '...',
  '.S.',
  'SSS',
  '.S.',
  '...',
  '...',
]

const pxBlank = (w: number) => Array.from({ length: 7 }, () => '.'.repeat(w))
const pxDashed = (s: string) =>
  Array.from({ length: 7 }, (_, r) => (r === 3 ? s : '.'.repeat(s.length)))

const PX_LINE_LEFT = 'g.g.G.G.G.'
const PX_LINE_RIGHT = PX_LINE_LEFT.split('').reverse().join('')

const PX_PIECES = [
  pxDashed(PX_LINE_LEFT),
  pxBlank(2),
  PX_HEART,
  pxBlank(2),
  PX_SPARKLE,
  pxBlank(2),
  PX_DIAMOND,
  pxBlank(2),
  PX_SPARKLE,
  pxBlank(2),
  PX_HEART,
  pxBlank(2),
  pxDashed(PX_LINE_RIGHT),
]

const PX_ROWS = Array.from({ length: 7 }, (_, r) => PX_PIECES.map(p => p[r]).join(''))
const PX_COLS = PX_ROWS[0].length

function PixelOrnament({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 pointer-events-none"
      style={{
        [position]: 40,
        width: 'min(285px, 80%)',
        transform: 'translateX(-50%)',
        animation: 'heroFade 1.6s ease-out 0.4s both',
      }}
    >
      <svg
        viewBox={`0 0 ${PX_COLS} 7`}
        width="100%"
        shapeRendering="crispEdges"
        style={{ display: 'block' }}
      >
        {PX_ROWS.map((row, y) =>
          row.split('').map((c, x) =>
            c === '.' ? null : (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={PX_COLORS[c]}
                className={c === 'S' ? 'px-twinkle' : undefined}
              />
            )
          )
        )}
      </svg>
    </div>
  )
}

// ===== Pixel avatars for the couple section =====
// Same idea as the ornament: one character = one square pixel (16 x 16 grid).
// . = empty, K = groom hair, Y = bride hair, S = skin, E = eye (blinks), C = cheek, M = mouth
// B/b = suit, W = shirt, R = bow tie, V = veil, D/d = dress
const AV_COLORS: Record<string, string> = {
  K: '#3b2a2a',
  Y: '#7a4a32',
  S: '#ffd9b8',
  E: '#23446b',
  C: '#f59ab9',
  M: '#c4607f',
  B: '#2f5d8c',
  b: '#4a90d9',
  W: '#ffffff',
  R: '#f59ab9',
  V: '#bcd9f3',
  D: '#ffffff',
  d: '#cfe4f7',
}

const AV_GROOM = [
  '................',
  '.....KKKKKK.....',
  '....KKKKKKKK....',
  '....KSSSSSSK....',
  '....SSSSSSSS....',
  '....SESSSSES....',
  '....SSSSSSSS....',
  '....SCSMMSCS....',
  '.....SSSSSS.....',
  '......SSSS......',
  '...BBBWRRWBBB...',
  '..BBBBBWWBBBBB..',
  '.BBBBBBbbBBBBBB.',
  '.BBBBBBbbBBBBBB.',
  '.BBBBBBbbBBBBBB.',
  '................',
]

const AV_BRIDE = [
  '................',
  '.....YYYYYY.....',
  '....YYYYYYYY....',
  '...VYYSSSSYYV...',
  '...VYSSSSSSYV...',
  '...VYSESSESYV...',
  '...VYSSSSSSYV...',
  '...VYSCMMCSYV...',
  '...VYYSSSSYYV...',
  '...VYYYSSYYYV...',
  '...VYYDDDDYYV...',
  '....YDDDDDDY....',
  '...VDDDDDDDDV...',
  '..VDDDDDDDDDDV..',
  '.dDDDDDDDDDDDDd.',
  '................',
]

function PixelAvatar({ rows, delay = 0 }: { rows: string[]; delay?: number }) {
  const h = rows.length
  const w = rows[0].length
  return (
    <div
      aria-hidden
      className="mx-auto mb-5 p-2"
      style={{
        width: 112,
        backgroundColor: 'rgba(255,255,255,0.6)',
        border: '2px solid rgba(74,144,217,0.5)',
        boxShadow: '0 0 0 3px rgba(74,144,217,0.15)',
      }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" shapeRendering="crispEdges" style={{ display: 'block' }}>
        <g className="px-bob" style={{ animationDelay: `${delay}s` }}>
          {rows.map((row, y) =>
            row.split('').map((c, x) => {
              if (c === '.') return null
              // Eyes: draw skin underneath, then the eye on top so it can blink
              if (c === 'E') {
                return (
                  <g key={`${x}-${y}`}>
                    <rect x={x} y={y} width={1} height={1} fill={AV_COLORS.S} />
                    <rect
                      x={x}
                      y={y}
                      width={1}
                      height={1}
                      fill={AV_COLORS.E}
                      className="px-blink"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  </g>
                )
              }
              return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={AV_COLORS[c]} />
            })
          )}
        </g>
      </svg>
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
            <style>{`
              @keyframes heroFade{from{opacity:0}to{opacity:1}}
              @keyframes pxTwinkle{0%,100%{opacity:1}50%{opacity:.2}}
              .px-twinkle{animation:pxTwinkle 1.6s steps(1,end) infinite}
              @media (prefers-reduced-motion:reduce){.px-twinkle{animation:none}}
              html body h1.hero-names{font-family:var(--font-cormorant),'Cormorant Garamond',Georgia,serif !important;font-weight:400 !important;text-transform:uppercase;letter-spacing:.06em;font-size:clamp(1.7rem,7.5vw,2.5rem) !important;line-height:1.2 !important;}
            `}</style>

            <div
              className="absolute pointer-events-none"
              style={{ inset: 14, border: '1px solid rgba(74,144,217,0.5)' }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ inset: 20, border: '1px solid rgba(74,144,217,0.2)' }}
            />

            {/* Pixel ornaments at the top and bottom of the frame */}
            <PixelOrnament position="top" />
            <PixelOrnament position="bottom" />

            <div
              className="relative w-full flex flex-col items-center"
              style={{ color: INK, textShadow: TEXT_GLOW }}
            >
              {t.heroEyebrow && (
                <p className="font-lux uppercase text-xs tracking-[0.5em] mb-5" style={{ color: MUTED }}>
                  <AnimatedText text={t.heroEyebrow} startDelay={0.1} step={0.03} />
                </p>
              )}

              <h1 className={`hero-names ${cormorant.variable}`}>
                <AnimatedText text={groomFirst} startDelay={groomDelay} step={letterStep} />
                {' '}
                <span style={{ fontSize: '0.72em', color: ACCENT }}>
                  <AnimatedText text="&" startDelay={ampDelay} step={letterStep} />
                </span>
                {' '}
                <AnimatedText text={brideFirst} startDelay={brideDelay} step={letterStep} />
              </h1>

              <div
                className="mx-auto mt-8 h-px w-28"
                style={{ background: 'linear-gradient(90deg,transparent,#4a90d9,transparent)' }}
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
                      color={ACCENT}
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
            {/* Avatar animations: gentle bob + blink (steps keep the pixel look) */}
            <style>{`
              @keyframes pxBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}
              @keyframes pxBlink{0%,90%,100%{opacity:1}93%,97%{opacity:0}}
              .px-bob{animation:pxBob 1.2s steps(1,end) infinite}
              .px-blink{animation:pxBlink 3.6s steps(1,end) infinite}
              @media (prefers-reduced-motion:reduce){.px-bob,.px-blink{animation:none}}
            `}</style>

            <ScrollReveal>
              <LuxPanel>
                {t.coupleTitle && (
                  <SectionTitle>
                    <AnimatedText text={t.coupleTitle} startDelay={0.1} step={0.035} />
                  </SectionTitle>
                )}

                <BlueLine />

                <div className="relative px-8 py-8">
                  <PixelAvatar rows={AV_GROOM} />
                  <h3
                    className={`${cinzel.className} text-2xl font-medium tracking-[0.08em] mb-3`}
                    style={{ color: INK }}
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

                <div className="relative text-3xl font-script" style={{ color: ACCENT }}>
                  <AnimatedText text="&" startDelay={0.2} step={0.03} />
                </div>

                <div className="relative px-8 py-8 pb-12">
                  {/* delay makes the bride bob and blink out of sync with the groom */}
                  <PixelAvatar rows={AV_BRIDE} delay={0.6} />
                  <h3
                    className={`${cinzel.className} text-2xl font-medium tracking-[0.08em] mb-3`}
                    style={{ color: INK }}
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

                <BlueLine />

                <div className="relative px-8 py-8 pb-12">
                  {t.eventName && (
                    <h3 className="font-lux uppercase text-2xl mb-5 text-center" style={{ color: INK, letterSpacing: '0.14em' }}>
                      <AnimatedText text={t.eventName} startDelay={0.2} step={0.035} />
                    </h3>
                  )}

                  <div className="font-lux inline-flex flex-col items-start gap-2 text-base mb-7 text-left" style={{ color: BODY }}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="shrink-0" style={{ color: ACCENT }} />
                      <span>
                        <AnimatedText text={settings?.weddingDate || ''} startDelay={0.5} step={0.025} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0" style={{ color: ACCENT }} />
                      <span>
                        <AnimatedText text={settings?.weddingTime || ''} startDelay={0.8} step={0.025} />
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="shrink-0 mt-1" style={{ color: ACCENT }} />
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
                        style={{
                          background: 'linear-gradient(180deg,#6fb1ec,#4a90d9)',
                          color: '#ffffff',
                          textShadow: 'none',
                          boxShadow: '0 3px 10px rgba(74,144,217,0.35)',
                        }}
                      >
                        <MapPin size={16} />
                        <AnimatedText text={t.mapsButton} startDelay={1.5} step={0.025} />
                      </a>
                    )}
                    {t.calendarButton && (
                      <a
                        href={icsHref}
                        download="Akad-Nikah.ics"
                        className="font-lux inline-flex items-center justify-center gap-2 px-6 py-2 text-sm rounded-full border transition hover:bg-[#4a90d9] hover:text-white"
                        style={{ borderColor: ACCENT, color: ACCENT, textShadow: 'none', backgroundColor: 'rgba(255,255,255,0.6)' }}
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

                <BlueLine />

                <div className="relative px-8 py-8 pb-12">
                  <div className="flex justify-center mb-4">
                    <Gift size={32} className="float-soft" style={{ color: ACCENT }} />
                  </div>

                  <p className="font-lux italic text-base mb-8 leading-relaxed" style={{ color: BODY }}>
                    <AnimatedText text={settings?.giftMessage || ''} startDelay={0.4} step={0.012} />
                  </p>

                  <div
                    className="flex flex-col items-center justify-center text-sm pt-6"
                    style={{ borderTop: `1px solid ${LINE}` }}
                  >
                    <div className="font-lux flex items-center gap-2 font-bold mb-2" style={{ color: INK }}>
                      <CreditCard size={18} style={{ color: ACCENT }} />
                      <span>
                        <AnimatedText text={settings?.bank1Name || ''} startDelay={1.5} step={0.03} />
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-2xl font-mono tracking-widest" style={{ color: ACCENT }}>
                        <AnimatedText text={settings?.bank1Number || ''} startDelay={1.8} step={0.03} />
                      </p>
                      {settings?.bank1Number && (
                        <CopyButton value={settings.bank1Number} label="Copy account number" />
                      )}
                    </div>
                    <p className="font-lux" style={{ color: MUTED }}>
                      <AnimatedText text={settings?.bank1Holder || ''} startDelay={2.2} step={0.025} />
                    </p>
                  </div>

                  <div
                    className="flex flex-col items-center justify-center text-sm pt-6 mt-6"
                    style={{ borderTop: `1px solid ${LINE}` }}
                  >
                    <div className="font-lux flex items-center gap-2 font-bold mb-2" style={{ color: INK }}>
                      <CreditCard size={18} style={{ color: ACCENT }} />
                      <span>
                        <AnimatedText text={settings?.bank2Name || ''} startDelay={2.6} step={0.03} />
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-2xl font-mono tracking-widest" style={{ color: ACCENT }}>
                        <AnimatedText text={settings?.bank2Number || ''} startDelay={2.9} step={0.03} />
                      </p>
                      {settings?.bank2Number && (
                        <CopyButton value={settings.bank2Number} label="Copy account number" />
                      )}
                    </div>
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

                <BlueLine />

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

          {/* Guestbook Wall */}
          <section className="py-12 px-6">
            <ScrollReveal>
              <LuxPanel>
                <div className="text-center">
                  <SectionTitle>
                    <AnimatedText text="Guestbook Wall" startDelay={0.1} step={0.035} />
                  </SectionTitle>
                </div>

                <BlueLine />

                <div className="relative px-8 py-8 pb-12">
                  <WishForm token={guest.token} guestName={guest.name} />
                </div>
              </LuxPanel>
            </ScrollReveal>

            {/* Messages appear here as pixel profiles with dialog boxes */}
            <div className="mt-8">
              <GuestbookWall wishes={wishes} />
            </div>
          </section>

          {footerText.trim() && (
            <footer className="py-8 text-center text-xs bg-[#2f5d8c]/80 backdrop-blur-md text-white">
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