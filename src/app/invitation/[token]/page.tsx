import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'
import WishForm from './WishForm'
import InvitationIntro from './InvitationIntro'
import ScrollReveal from './ScrollReveal'
import { MapPin, Calendar, Clock, Gift, CreditCard, Leaf, CalendarPlus } from 'lucide-react'

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
    <InvitationIntro guestName={guest.name}>
      <div className="max-w-md mx-auto shadow-xl min-h-screen overflow-hidden relative bg-cream">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 brightness-75 saturate-50"
        >
          <source src="/intro-bg.mp4" type="video/mp4" />
        </video>

        {/* Global overlay */}
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[1px] z-[1] pointer-events-none"></div>

        {/* Falling petals/glitter across the entire page */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]">
          <div className="absolute -top-10 left-[5%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_5s_linear_infinite_0.1s]"></div>
          <div className="absolute -top-10 left-[12%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_7s_linear_infinite_1.5s]"></div>
          <div className="absolute -top-10 left-[18%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_4s_linear_infinite_0.8s]"></div>
          <div className="absolute -top-10 left-[25%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_6s_linear_infinite_2.2s]"></div>
          <div className="absolute -top-10 left-[32%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_5.5s_linear_infinite_0.4s]"></div>
          <div className="absolute -top-10 left-[40%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_4.5s_linear_infinite_1.1s]"></div>
          <div className="absolute -top-10 left-[48%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_6.5s_linear_infinite_2.8s]"></div>
          <div className="absolute -top-10 left-[55%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_5s_linear_infinite_1.9s]"></div>
          <div className="absolute -top-10 left-[62%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_4s_linear_infinite_0.6s]"></div>
          <div className="absolute -top-10 left-[70%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_7s_linear_infinite_2.0s]"></div>
          <div className="absolute -top-10 left-[78%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_4.5s_linear_infinite_1.3s]"></div>
          <div className="absolute -top-10 left-[85%] w-2 h-2 bg-white rounded-full shadow-[0_0_9px_#ffffff] animate-[fall_6s_linear_infinite_0.3s]"></div>
          <div className="absolute -top-10 left-[93%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_5s_linear_infinite_2.5s]"></div>
        </div>

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="relative min-h-screen flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">

              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70 w-full animate-reveal-up overflow-hidden" style={{ animationDelay: '0.2s' }}>

                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative px-8 pt-12 pb-6">
                  <p className="text-sm tracking-[0.3em] uppercase mb-4 text-dark-brown font-semibold">
                    The Wedding Of
                  </p>
                  <h1 className="text-6xl md:text-7xl text-gold" style={{ fontFamily: "'Edwardian Script ITC', 'Lucida Calligraphy', 'Baskerville', cursive" }}>
                    {settings?.groomName?.split(' ')[0]} <span className="text-4xl md:text-5xl text-gold/80">&</span> {settings?.brideName?.split(' ')[0]}
                  </h1>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 py-6">
                  <p className="text-sm mb-2 text-dark-brown font-medium">
                    To Our Beloved Guest,
                  </p>
                  <p
                    className="text-4xl text-gold"
                    style={{ fontFamily: "'Monotype Corsiva', 'Snell Roundhand', 'Apple Chancery', cursive" }}
                  >
                    {guest.name}
                  </p>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 pt-6 pb-12">
                  <p className="text-sm text-dark-brown font-medium italic mb-2">
                    {settings?.welcomeMessage}
                  </p>
                  <Leaf className="mx-auto text-gold" size={20} strokeWidth={1.5} fill="none" />
                </div>

              </div>

            </div>
          </section>

          {/* Couple Section */}
          <section className="py-16 px-8 text-center">
            <ScrollReveal>
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70 w-full overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative px-8 pt-10 pb-6">
                  <h2 className="text-2xl font-serif italic text-gold">The Groom & The Bride</h2>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 py-8">
                  <h3 className="font-serif text-3xl font-bold text-dark-brown mb-3">{settings?.groomName}</h3>
                  <p className="text-sm text-stone-700 mb-1">Putra dari:</p>
                  <p className="text-sm text-stone-700">{settings?.groomParents}</p>
                </div>

                <div className="relative text-xl text-gold font-serif">&</div>

                <div className="relative px-8 py-8">
                  <h3 className="font-serif text-3xl font-bold text-dark-brown mb-3">{settings?.brideName}</h3>
                  <p className="text-sm text-stone-700 mb-1">Putri dari:</p>
                  <p className="text-sm text-stone-700">{settings?.brideParents}</p>
                </div>

              </div>
            </ScrollReveal>
          </section>

          {/* Event Details */}
          <section className="py-16 px-8 text-center">
            <ScrollReveal>
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70 w-full overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative px-8 pt-10 pb-6">
                  <h2 className="text-2xl font-serif italic text-gold">Wedding Event</h2>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 py-8">
                  <h3 className="text-xl font-serif mb-4 text-dark-brown text-center">Akad Nikah</h3>

                  <div className="inline-flex flex-col items-start gap-2 text-sm text-dark-brown mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gold shrink-0"/>
                      <span>{settings?.weddingDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gold shrink-0"/>
                      <span>{settings?.weddingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gold shrink-0"/>
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

              </div>
            </ScrollReveal>
          </section>

          {/* Wedding Gift Section */}
          <section className="py-16 px-8 text-center">
            <ScrollReveal>
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70 w-full overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative px-8 pt-10 pb-6">
                  <h2 className="text-2xl font-serif italic text-gold">Gift & Support</h2>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 py-8">
                  <div className="flex justify-center mb-4">
                    <Gift size={32} className="text-gold" />
                  </div>

                  <p className="text-sm text-stone-700 mb-8 leading-relaxed">
                    {settings?.giftMessage}
                  </p>

                  <div className="flex flex-col items-center justify-center text-sm border-t border-stone-400/40 pt-6">
                    <div className="flex items-center gap-2 font-bold text-dark-brown mb-2">
                      <CreditCard size={18} className="text-gold"/>
                      <span>{settings?.bank1Name}</span>
                    </div>
                    <p className="text-2xl font-mono text-gold tracking-widest mb-1">{settings?.bank1Number}</p>
                    <p className="text-stone-600">{settings?.bank1Holder}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-sm border-t border-stone-400/40 pt-6 mt-6">
                    <div className="flex items-center gap-2 font-bold text-dark-brown mb-2">
                      <CreditCard size={18} className="text-gold"/>
                      <span>{settings?.bank2Name}</span>
                    </div>
                    <p className="text-2xl font-mono text-gold tracking-widest mb-1">{settings?.bank2Number}</p>
                    <p className="text-stone-600">{settings?.bank2Holder}</p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </section>

          {/* RSVP */}
          <section className="py-16 px-8 text-center">
            <ScrollReveal>
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70 w-full overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative px-8 pt-10 pb-6">
                  <h2 className="text-2xl font-serif italic text-gold">RSVP</h2>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 py-8">
                  <RsvpForm token={guest.token} initialRsvp={guest.rsvp} guestName={guest.name} />
                </div>

              </div>
            </ScrollReveal>
          </section>

          {/* Wishes */}
          <section className="py-16 px-8">
            <ScrollReveal>
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70 w-full overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative px-8 pt-10 pb-6 text-center">
                  <h2 className="text-2xl font-serif italic text-gold">Ucapan & Doa</h2>
                </div>

                <div className="relative h-px bg-stone-400/40 mx-8"></div>

                <div className="relative px-8 py-8">
                  <WishForm token={guest.token} guestName={guest.name} />
                </div>

              </div>
            </ScrollReveal>

            <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {wishes.map((wish, i) => (
                <ScrollReveal key={wish.id} delay={Math.min(i * 60, 400)}>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/70">
                    <p className="font-bold text-sm text-dark-brown">{wish.guest.name}</p>
                    <p className="text-sm mt-2 text-stone-700">{wish.message}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <footer className="py-8 text-center text-xs bg-dark-brown/90 backdrop-blur-md text-white">
            <p>&copy; 2026 {settings?.groomName?.split(' ')[0]} & {settings?.brideName?.split(' ')[0]}. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </InvitationIntro>
  )
}