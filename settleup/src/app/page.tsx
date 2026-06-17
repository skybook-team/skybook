import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-full bg-gray-950 text-gray-100">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold">SettleUp</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Free for everyone
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Split expenses,{' '}
          <span className="text-green-400">not friendships</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Track shared expenses with friends, roommates, and travel buddies.
          SettleUp makes it simple to split bills and settle debts fairly.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors"
          >
            Get started for free
          </Link>
          <Link
            href="/login"
            className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl text-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Everything you need to split fairly
        </h2>
        <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
          Powerful features designed for real-world expense splitting
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '👥',
              title: 'Groups',
              desc: 'Create groups for trips, apartments, or any shared expense. Invite members by email.',
            },
            {
              icon: '⚖️',
              title: 'Smart Splits',
              desc: 'Split equally, by percentage, or exact amounts. Full flexibility for every situation.',
            },
            {
              icon: '📊',
              title: 'Analytics',
              desc: 'Visualize spending with interactive charts. Understand where your money goes.',
            },
            {
              icon: '📷',
              title: 'Receipt Scanning',
              desc: 'Upload a photo of your receipt and we automatically extract the amount.',
            },
            {
              icon: '🔄',
              title: 'Recurring Expenses',
              desc: 'Mark expenses as weekly or monthly. Never forget to split rent again.',
            },
            {
              icon: '✉️',
              title: 'Email Reminders',
              desc: 'Automatically remind friends about outstanding balances. No awkward conversations.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/30 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to settle up?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join thousands of people who use SettleUp to keep friendships
            and finances in order.
          </p>
          <Link
            href="/login"
            className="inline-block bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors"
          >
            Start for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-xs">S</span>
            </div>
            <span className="font-semibold">SettleUp</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 SettleUp. Split expenses, not friendships.
          </p>
        </div>
      </footer>
    </div>
  )
}
