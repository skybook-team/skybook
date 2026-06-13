'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUser, clearUser, type User } from '@/lib/store'

const TABS = [
  { label: 'Flights', href: '/', icon: '✈️' },
  { label: 'Hotels', href: '#', icon: '🏨' },
  { label: 'Cars', href: '#', icon: '🚗' },
  { label: 'Packages', href: '#', icon: '📦' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setUser(getUser()) }, [pathname])

  function handleSignOut() {
    clearUser(); setUser(null); setDropdownOpen(false); router.push('/')
  }

  const isSearchPage = pathname === '/search' || pathname.startsWith('/booking') || pathname.startsWith('/confirmation')

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
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

          {/* Service tabs — only on non-search pages */}
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

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>My Trips</Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5">Sign In</Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors">Register</Link>
              </div>
            )}
            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
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
          {TABS.map(t => <Link key={t.label} href={t.href} className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>{t.icon} {t.label}</Link>)}
          <hr className="my-2 border-gray-100" />
          {user ? (
            <button onClick={handleSignOut} className="block w-full text-left py-2 text-sm text-red-600">Sign Out</button>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="block py-2 text-sm font-medium text-blue-600" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
