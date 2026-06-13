'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const TABS = [
  { label: 'Flights',  href: '/',  icon: '✈️' },
  { label: 'Hotels',   href: '#',  icon: '🏨' },
  { label: 'Cars',     href: '#',  icon: '🚗' },
  { label: 'Packages', href: '#',  icon: '📦' },
]

export default function Navbar() {
  const pathname   = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isSearchPage = pathname === '/search' || pathname.startsWith('/booking') || pathname.startsWith('/confirmation')

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              sky<span className="text-blue-600">book</span>
            </span>
          </Link>

          {/* Service tabs — hidden on booking/search/confirmation pages */}
          {!isSearchPage && (
            <nav className="hidden md:flex items-center gap-1 mx-6">
              {TABS.map(tab => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tab.label === 'Flights'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Trips
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {TABS.map(t => (
            <Link
              key={t.label}
              href={t.href}
              className="block py-2 text-sm font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              {t.icon} {t.label}
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />
          <Link
            href="/account"
            className="block py-2 text-sm font-medium text-gray-700"
            onClick={() => setMobileOpen(false)}
          >
            My Trips
          </Link>
        </div>
      )}
    </header>
  )
}
