import SearchForm from '@/app/_components/SearchForm'
import AirlineLogoGrid from '@/app/_components/AirlineLogoGrid'
import Link from 'next/link'

const DEALS = [
  { from: 'JFK', to: 'LAX', fromCity: 'New York',      toCity: 'Los Angeles',  price: 178, was: 329, tags: ['Nonstop available'], color: 'from-violet-500 to-purple-600' },
  { from: 'ORD', to: 'MIA', fromCity: 'Chicago',       toCity: 'Miami',        price: 138, was: 259, tags: ['Best seller'],        color: 'from-rose-500 to-pink-600'    },
  { from: 'LAX', to: 'LHR', fromCity: 'Los Angeles',   toCity: 'London',       price: 649, was: 1099, tags: ['Limited seats'],    color: 'from-sky-500 to-blue-600'     },
  { from: 'JFK', to: 'CUN', fromCity: 'New York',      toCity: 'Cancún',       price: 219, was: 389, tags: ['Nonstop available'],  color: 'from-emerald-500 to-teal-600' },
  { from: 'SFO', to: 'JFK', fromCity: 'San Francisco', toCity: 'New York',     price: 168, was: 289, tags: ['Deal of the day'],    color: 'from-orange-500 to-amber-600' },
  { from: 'ATL', to: 'DEN', fromCity: 'Atlanta',       toCity: 'Denver',       price: 119, was: 219, tags: ['Nonstop'],            color: 'from-cyan-500 to-indigo-600'  },
]

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 14)
const defaultDate = tomorrow.toISOString().split('T')[0]

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative" style={{ background: 'linear-gradient(145deg,#0a0f3d 0%,#1a3ab8 40%,#0e7bd4 75%,#00c2e8 100%)' }}>
        {/* Decorative layer — overflow-hidden scoped here so the dropdown isn't clipped */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24">

          {/* Headline */}
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 border border-white/20 uppercase tracking-widest">
              <span>✈️</span> All Major US Airlines · One Search
            </p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
              Find Flights.<br className="sm:hidden" />
              <span className="bg-gradient-to-r from-cyan-300 to-sky-200 bg-clip-text text-transparent"> Not Surprises.</span>
            </h1>
            <p className="text-blue-200/90 text-lg font-medium">
              No booking fees · No hidden charges · Real prices
            </p>
          </div>

          {/* Search form — relative + z-10 so its dropdown always paints above trust badges */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl shadow-black/30 p-6 sm:p-8">
            <SearchForm />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: '🔒', text: 'Secure booking' },
              { icon: '✅', text: 'No booking fees' },
              { icon: '💳', text: 'Free cancellation on select fares' },
              { icon: '🌎', text: 'All major airlines' },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                <span>{b.icon}</span>{b.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's Deals ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Today&apos;s Top Flight Deals</h2>
            <p className="text-gray-500 text-sm mt-1">Fares as of today · Click to search</p>
          </div>
          <span className="hidden sm:block text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            Round-trip prices shown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEALS.map(deal => {
            const pct = Math.round((1 - deal.price / deal.was) * 100)
            return (
              <Link
                key={`${deal.from}-${deal.to}`}
                href={`/search?from=${deal.from}&to=${deal.to}&date=${defaultDate}&passengers=1&cabinClass=economy&tripType=roundTrip`}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Gradient header */}
                <div className={`h-2 bg-gradient-to-r ${deal.color}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-black text-gray-900">{deal.fromCity}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg font-black text-gray-900">{deal.toCity}</span>
                      </div>
                      <p className="text-xs font-mono text-gray-400 tracking-wide">{deal.from} → {deal.to}</p>
                    </div>
                    <span className={`bg-gradient-to-r ${deal.color} text-white text-xs font-black px-2.5 py-1 rounded-full shrink-0`}>
                      -{pct}%
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-wrap gap-1">
                      {deal.tags.map(tag => (
                        <span key={tag} className="inline-block text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 line-through">${deal.was}</p>
                      <p className="text-3xl font-black text-gray-900 leading-none">${deal.price}</p>
                      <p className="text-xs text-gray-400 mt-0.5">per person</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Partner Airlines ── */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-8">
            Searching fares across all major US carriers
          </p>
          <AirlineLogoGrid />
        </div>
      </section>

      {/* ── Why SkyBook ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Why travelers choose SkyBook</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { gradient: 'from-violet-500 to-purple-600', icon: '💰', title: 'No Booking Fees', body: 'The price you see is the price you pay — taxes and carrier fees included. Always.' },
            { gradient: 'from-sky-500 to-blue-600',     icon: '🔒', title: 'Secure & Private', body: 'Your payment and personal info is protected with 256-bit SSL and never sold to third parties.' },
            { gradient: 'from-emerald-500 to-teal-600', icon: '📱', title: 'Instant E-Ticket',  body: 'Your confirmation and e-ticket arrive instantly to your email. No printing needed.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-7 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-4 sm:mx-8 mb-14 rounded-3xl overflow-hidden">
        <div className="relative" style={{ background: 'linear-gradient(135deg,#0a0f3d 0%,#1a3ab8 50%,#0e7bd4 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative max-w-2xl mx-auto px-6 py-14 text-center">
            <h2 className="text-3xl font-black text-white mb-3">Ready to take off?</h2>
            <p className="text-blue-200 mb-8 text-lg">Search all major airlines and find the best fares in seconds.</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-black px-10 py-3.5 rounded-full transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Search Flights Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
