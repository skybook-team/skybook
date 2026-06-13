import SearchForm from '@/app/_components/SearchForm'
import Link from 'next/link'

const POPULAR_ROUTES = [
  { from: 'JFK', to: 'LAX', fromCity: 'New York', toCity: 'Los Angeles', price: 189 },
  { from: 'ORD', to: 'MIA', fromCity: 'Chicago', toCity: 'Miami', price: 129 },
  { from: 'SFO', to: 'JFK', fromCity: 'San Francisco', toCity: 'New York', price: 219 },
  { from: 'LAX', to: 'LHR', fromCity: 'Los Angeles', toCity: 'London', price: 549 },
  { from: 'JFK', to: 'CUN', fromCity: 'New York', toCity: 'Cancun', price: 249 },
  { from: 'ATL', to: 'DEN', fromCity: 'Atlanta', toCity: 'Denver', price: 109 },
]

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Best Price Guarantee',
    desc: 'We compare hundreds of airlines to find you the cheapest fares available.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Booking',
    desc: 'Your payment and personal data are protected with industry-standard encryption.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Flexible Payment',
    desc: 'Pay with any major credit card or debit card. No hidden fees.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    desc: 'Our support team is available around the clock to help with any questions.',
  },
]

const today = new Date()
today.setDate(today.getDate() + 14)
const defaultDate = today.toISOString().split('T')[0]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[520px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
              Find Your Next Flight
            </h1>
            <p className="text-blue-100 text-lg">
              Compare prices across 500+ airlines. Book cheap flights in minutes.
            </p>
          </div>

          {/* Search card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Routes</h2>
        <p className="text-gray-500 text-sm mb-6">Trending destinations with great prices</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_ROUTES.map(route => (
            <Link
              key={`${route.from}-${route.to}`}
              href={`/search?from=${route.from}&to=${route.to}&date=${defaultDate}&passengers=1&cabinClass=economy&tripType=oneWay`}
              className="group flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                    {route.fromCity} → {route.toCity}
                  </p>
                  <p className="text-xs text-gray-400">{route.from} → {route.to}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">from</p>
                <p className="text-lg font-bold text-blue-600">${route.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Book with SkyBook?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to fly?</h2>
          <p className="text-blue-100 mb-6">Create a free account to save your trips and get personalized deals.</p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
