import SearchForm from '@/app/_components/SearchForm'
import AirlineLogoGrid from '@/app/_components/AirlineLogoGrid'
import Link from 'next/link'

const DEALS = [
  { from: 'JFK', to: 'LAX', fromCity: 'New York',       toCity: 'Los Angeles',  price: 129, was: 219, tags: ['Nonstop available'] },
  { from: 'ORD', to: 'MIA', fromCity: 'Chicago',        toCity: 'Miami',        price: 89,  was: 159, tags: ['Best seller'] },
  { from: 'LAX', to: 'LHR', fromCity: 'Los Angeles',    toCity: 'London',       price: 449, was: 699, tags: ['Limited seats'] },
  { from: 'JFK', to: 'CUN', fromCity: 'New York',       toCity: 'Cancún',       price: 179, was: 289, tags: ['Nonstop available'] },
  { from: 'SFO', to: 'JFK', fromCity: 'San Francisco',  toCity: 'New York',     price: 149, was: 239, tags: ['Deal of the day'] },
  { from: 'ATL', to: 'DEN', fromCity: 'Atlanta',        toCity: 'Denver',       price: 79,  was: 139, tags: ['Nonstop'] },
]


const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 14)
const defaultDate = tomorrow.toISOString().split('T')[0]

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative" style={{ background: 'linear-gradient(160deg,#003580 0%,#0057b8 55%,#0080c9 100%)' }}>
        {/* subtle dot pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">
          <div className="text-center mb-8">
            <p className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              ✈️ &nbsp;Compare 500+ Airlines Instantly
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
              Find Flights.<br className="sm:hidden" /> Not Surprises.
            </h1>
            <p className="text-blue-200 text-lg">
              Best prices guaranteed — no hidden fees, ever.
            </p>
          </div>

          {/* Search card */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-7">
            {/* Tab bar inside card */}
            <div className="flex items-center gap-1 mb-5 border-b border-gray-100 pb-4">
              {['Flights ✈️', 'Hotels 🏨', 'Cars 🚗', 'Packages 📦'].map((t, i) => (
                <button key={t} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {t}
                </button>
              ))}
            </div>
            <SearchForm />
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-white/70 text-xs font-medium">
            {['🔒 Secure booking', '✅ No booking fees', '💳 Free cancellation on select fares', '🌎 500+ airlines'].map(b => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's Deals ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Today&apos;s Top Flight Deals</h2>
            <p className="text-gray-500 text-sm mt-1">Prices updated in real time · Book before they&apos;re gone</p>
          </div>
          <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Round-trip prices shown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEALS.map(deal => {
            const pct = Math.round((1 - deal.price / deal.was) * 100)
            return (
              <Link
                key={`${deal.from}-${deal.to}`}
                href={`/search?from=${deal.from}&to=${deal.to}&date=${defaultDate}&passengers=1&cabinClass=economy&tripType=roundTrip`}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Color strip */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-black text-gray-900">{deal.fromCity}</span>
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-base font-black text-gray-900">{deal.toCity}</span>
                      </div>
                      <p className="text-xs text-gray-400">{deal.from} → {deal.to}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">-{pct}%</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      {deal.tags.map(tag => (
                        <span key={tag} className="inline-block text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full mr-1">{tag}</span>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 line-through">${deal.was}</p>
                      <p className="text-2xl font-black text-blue-600">${deal.price}</p>
                      <p className="text-xs text-gray-400">per person</p>
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
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Searching fares across all major airlines
          </p>
          <AirlineLogoGrid />
        </div>
      </section>

      {/* ── Why SkyBook ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Why millions choose SkyBook</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '💰', title: 'Lowest Fares', body: 'Our algorithm compares thousands of fare combinations to surface the absolute cheapest option for your route.' },
            { icon: '🔒', title: 'Price Lock', body: 'Found a great fare? Lock it for 24 hours while you decide. No charge until you confirm.' },
            { icon: '📱', title: 'Instant E-Ticket', body: 'Get your boarding pass and e-ticket instantly. No printing required, accepted at all airports.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-12 mb-0">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Ready to take off?</h2>
          <p className="text-blue-100 mb-6">Search 500+ airlines instantly and find the best fares in seconds.</p>
          <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-md">
            Search Flights Now
          </Link>
        </div>
      </section>

    </div>
  )
}
