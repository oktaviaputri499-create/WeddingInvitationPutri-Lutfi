import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'
import WishForm from './WishForm'
import { MapPin, Calendar, Clock, Gift, CreditCard } from 'lucide-react'

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

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen overflow-hidden">
   {/* Hero Section dengan Efek Partikel Animasi Elegan */}
        <section 
          className="relative min-h-screen flex flex-col items-center justify-center p-8 text-center bg-cover bg-center border-b-8 border-gold overflow-hidden"
          style={{ backgroundImage: "url('/bg-depan.jpg')" }}
        >
          {/* Layer Overlay Semi-Transparan */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>

          {/* Animasi Glitter & Shimmer Putih Murni (Lebih Ramai & Lebat) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Jalur 1 */}
            <div className="absolute -top-10 left-[5%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_5s_linear_infinite_0.1s]"></div>
            <div className="absolute -top-10 left-[12%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_7s_linear_infinite_1.5s]"></div>
            <div className="absolute -top-10 left-[18%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_4s_linear_infinite_0.8s]"></div>
            <div className="absolute -top-10 left-[25%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_6s_linear_infinite_2.2s]"></div>
            
            {/* Jalur 2 */}
            <div className="absolute -top-10 left-[32%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_5.5s_linear_infinite_0.4s]"></div>
            <div className="absolute -top-10 left-[40%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_4.5s_linear_infinite_1.1s]"></div>
            <div className="absolute -top-10 left-[48%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_6.5s_linear_infinite_2.8s]"></div>
            <div className="absolute -top-10 left-[55%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_5s_linear_infinite_1.9s]"></div>
            
            {/* Jalur 3 */}
            <div className="absolute -top-10 left-[62%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] animate-[fall_4s_linear_infinite_0.6s]"></div>
            <div className="absolute -top-10 left-[70%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_7s_linear_infinite_2.0s]"></div>
            <div className="absolute -top-10 left-[78%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-[fall_4.5s_linear_infinite_1.3s]"></div>
            <div className="absolute -top-10 left-[85%] w-2 h-2 bg-white rounded-full shadow-[0_0_9px_#ffffff] animate-[fall_6s_linear_infinite_0.3s]"></div>
            <div className="absolute -top-10 left-[93%] w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-[fall_5s_linear_infinite_2.5s]"></div>
          </div>

          {/* Konten Teks */}
          <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center animate-fade-in-up">
            
            <p className="text-sm tracking-[0.3em] uppercase mb-4 text-dark-brown/70 font-medium">
              The Wedding Of
            </p>
            
            <h1 className="text-6xl md:text-7xl text-gold mb-14 drop-shadow-sm" style={{ fontFamily: "'Edwardian Script ITC', 'Lucida Calligraphy', 'Baskerville', cursive" }}>
              Lutfi <span className="text-4xl md:text-5xl text-gold/80">&</span> Putri
            </h1>

            {/* Kotak Nama Tamu */}
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gold/30 w-full mb-10 transform transition-all hover:scale-[1.02]">
              <p className="text-sm mb-2 text-stone-600">To Our Beloved Guest,</p>
              <p className="text-4xl text-dark-brown" style={{ fontFamily: "'Monotype Corsiva', 'Snell Roundhand', 'Apple Chancery', cursive" }}>{guest.name}</p>
            </div>

            <p className="text-sm px-4 text-stone-700 italic drop-shadow-sm">
              We would love to celebrate this special day with you :
            </p>

          </div>
        </section>

      {/* Couple Section */}
<section className="py-16 px-8 text-center bg-white">
  {/* Tulisan Groom & Bride yang elegan */}
  <h2 className="text-4xl font-serif italic text-gold mb-8">The Groom & The Bride</h2>
  
  <div className="flex flex-col gap-8">
    
    {/* Pengantin Pria (Groom - Ikon Tunggal) */}
    <div>
      <div className="w-36 h-36 bg-white rounded-full mx-auto mb-4 border-2 border-gold shadow-md overflow-hidden flex items-center justify-center">
        <img 
          src="https://i.pinimg.com/1200x/c5/a5/ca/c5a5cab75fdf1eb6fb6cfab4177ac623.jpg" 
          alt="Mempelai Pria" 
          className="w-20 h-20 object-contain" 
        />
      </div>
      {/* Nama dibuat lebih besar (text-2xl) dan tebal (font-bold) */}
      <h3 className="font-serif text-2xl font-bold text-stone-800">Lutfi Arlanda</h3>
      <p className="text-sm text-stone-500">Putra dari Bapak Suparlan & Ibu Titik</p>
    </div>
    
    <div className="text-2xl text-gold font-serif">&</div>
    
    {/* Pengantin Wanita (Bride - Ikon Tunggal) */}
    <div>
      <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 border-2 border-gold shadow-md flex items-center justify-center p-3">
        <img 
          src="https://i.pinimg.com/736x/7f/be/44/7fbe44ec97d4655ae3dc4891f3b6b3e1.jpg" 
          alt="Mempelai Wanita" 
          className="w-20 h-20 object-contain" 
        />
      </div>
      {/* Nama dibuat lebih besar (text-2xl) dan tebal (font-bold) */}
      <h3 className="font-serif text-2xl font-bold text-stone-800">Putri Oktavia</h3>
      <p className="text-sm text-stone-500">Putri dari Bapak Supiyanto & Ibu Widaryati</p>
    </div>

  </div>
</section>

      {/* Event Details */}
      <section className="py-16 px-8 bg-cream text-center">
        <h2 className="text-3xl font-serif text-gold mb-8">Wedding Event</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gold/20">
          <h3 className="text-xl font-serif mb-4">Akad Nikah</h3>
          <div className="flex items-center justify-center gap-2 text-sm mb-2">
            <Calendar size={16} className="text-gold"/>
            <span>Sabtu, 7 Juli 2027</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm mb-4">
            <Clock size={16} className="text-gold"/>
            <span>08:00 WIB - Selesai</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gold/20">
          <h3 className="text-xl font-serif mb-4">Resepsi</h3>
          <div className="flex items-center justify-center gap-2 text-sm mb-2">
            <Calendar size={16} className="text-gold"/>
            <span>Sabtu, 20 November 2026</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm mb-4">
            <Clock size={16} className="text-gold"/>
            <span>11:00 WIB - 14:00 WIB</span>
          </div>
          <div className="flex items-start justify-center gap-2 text-sm mb-4 text-left px-4">
            <MapPin size={24} className="text-gold shrink-0"/>
            <span>Grand Ballroom Hotel Jakarta<br/>Jl. Jenderal Sudirman No. 1, Jakarta</span>
          </div>
          <a href="#" className="inline-block px-6 py-2 bg-dark-brown text-white text-sm rounded-full mt-2 hover:bg-gold transition">
            Buka Google Maps
          </a>
        </div>
      </section>

{/* Wedding Gift Section */}
      <section className="py-16 px-8 bg-cream text-center">
        <h2 className="text-3xl font-serif text-gold mb-8">Gift & Support</h2>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gold/20 max-w-md mx-auto">
          {/* Ikon Kado di atas teks */}
          <div className="flex justify-center mb-4">
            <Gift size={32} className="text-gold" />
          </div>
          
          {/* Kata-kata pengantar yang elegan */}
          <p className="text-sm text-stone-600 mb-8 leading-relaxed">
            Tak ada yang lebih berarti bagi kami selain kehadiran dan doa baik Anda. Jika ingin turut berbagi kebahagiaan di hari istimewa ini, dapat melalui:
          </p>

          {/* Bagian Rekening dengan Ikon Kartu */}
          <div className="flex flex-col items-center justify-center text-sm border-t border-stone-100 pt-6">
            <div className="flex items-center gap-2 font-bold text-dark-brown mb-2">
              <CreditCard size={18} className="text-gold"/>
              <span>Bank BCA</span>
            </div>
            <p className="text-2xl font-mono text-gold tracking-widest mb-1">8268009977</p>
            <p className="text-stone-500">Putri Oktavia </p>
          </div>
{/* Rekening 2 */}
          <div className="flex flex-col items-center justify-center text-sm border-t border-stone-100 pt-6 mt-6">
            <div className="flex items-center gap-2 font-bold text-dark-brown mb-2">
              <CreditCard size={18} className="text-gold"/>
              <span>Bank BCA</span>
            </div>
            <p className="text-2xl font-mono text-gold tracking-widest mb-1">7790476390</p>
            <p className="text-stone-500">Lutfi Arlanda</p>
          </div>
        </div>

      </section>

      {/* RSVP */}
      <section className="py-16 px-8 bg-white text-center">
        <h2 className="text-3xl font-serif text-gold mb-8">RSVP</h2>
        <RsvpForm token={guest.token} initialRsvp={guest.rsvp} guestName={guest.name} />
      </section>

      {/* Wishes */}
      <section className="py-16 px-8 bg-cream">
        <h2 className="text-3xl font-serif text-gold mb-8 text-center">Ucapan & Doa</h2>
        <WishForm token={guest.token} guestName={guest.name} />
        
        <div className="mt-12 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {wishes.map((wish) => (
            <div key={wish.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
              <p className="font-bold text-sm text-dark-brown">{wish.guest.name}</p>
              <p className="text-sm mt-2 text-stone-600">{wish.message}</p>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="py-8 text-center text-xs text-stone-400 bg-dark-brown text-white">
        <p>&copy; 2026 Lutfi & Putri. All rights reserved.</p>
      </footer>
    </div>
  )
}
