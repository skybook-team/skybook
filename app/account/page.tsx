'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUser, getBookings, clearUser, type User } from '@/lib/store'
import { formatTime, formatDate, formatDuration, type CompletedBooking } from '@/lib/data'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<CompletedBooking[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    setBookings(getBookings())
    setLoaded(true)
  }, [])

  function handleSignOut() {
    clearUser()
    router.push('/')
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your trips</h2>
          <p className="text-gray-500 text-sm mb-6">Create an account or sign in to manage your bookings.</p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login" className="bg-blue-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Create Account
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Booked without an account?</p>
            <p className="text-xs text-gray-400">Your trips are saved in this browser. Sign in to access them across devices.</p>
            <button
              onClick={() => { setUser({ id: 'guest', name: 'Guest', email: '', createdAt: '' }); setBookings(getBookings()) }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              View bookings in this browser
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
              {user.createdAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          {user.id !== 'guest' && (
            <button onClick={handleSignOut} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Sign Out
            </button>
          )}
        </div>

        {/* Bookings */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          My Trips <span className="text-gray-400 font-normal text-sm">({bookings.length})</span>
        </h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <p className="text-gray-500 mb-4">No trips yet. Book your first flight!</p>
            <Link href="/" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Search Flights
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: CompletedBooking }) {
  const { outboundFlight: flight, returnFlight, pnr, cabinClass, totalPrice, passengers, createdAt } = booking
  const isUpcoming = new Date(flight.departureTime) > new Date()

  return (
    <Link href={`/confirmation/${booking.id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: flight.airline.color }}
            >
              {flight.airline.code}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {flight.origin.city} → {flight.destination.city}
                {returnFlight && ' (Round Trip)'}
              </p>
              <p className="text-xs text-gray-400">{flight.airline.name} · {flight.flightNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${isUpcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </span>
            <p className="text-xs text-gray-400 mt-1">Ref: <span className="font-mono font-bold text-gray-600">{pnr}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
            <p className="text-xs text-gray-500">{flight.origin.code}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400">{formatDuration(flight.durationMinutes)}</p>
            <div className="h-0.5 bg-gray-200" />
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{formatTime(flight.arrivalTime)}</p>
            <p className="text-xs text-gray-500">{flight.destination.code}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>{formatDate(flight.departureTime)} · {passengers.length} pax · <span className="capitalize">{cabinClass}</span></span>
          <span className="font-semibold text-gray-700">${totalPrice}</span>
        </div>
      </div>
    </Link>
  )
}
