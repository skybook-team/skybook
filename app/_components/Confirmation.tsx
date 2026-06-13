'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBookingById } from '@/lib/store'
import { formatTime, formatDate, formatDuration, formatPrice, type CompletedBooking, type Flight } from '@/lib/data'

export default function Confirmation({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<CompletedBooking | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const data = getBookingById(bookingId)
    if (!data) { setNotFound(true); return }
    setBooking(data)
  }, [bookingId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Booking not found.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Go Home</Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const {
    outboundFlight, returnFlight, pnr, passengers, selectedSeats,
    addOns, cabinClass, totalPrice, contactEmail, taxes, baseFare, addOnsCost,
  } = booking

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm">
            A confirmation has been sent to <span className="font-medium text-gray-700">{contactEmail}</span>
          </p>
          <div className="mt-5 inline-block bg-blue-50 border border-blue-200 rounded-xl px-6 py-3">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Booking Reference</p>
            <p className="text-3xl font-black text-blue-700 tracking-widest">{pnr}</p>
          </div>
        </div>

        {/* Flight details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Flight Details</h2>
          <FlightDetailCard flight={outboundFlight} label="Outbound" cabinClass={cabinClass} />
          {returnFlight && <FlightDetailCard flight={returnFlight} label="Return" cabinClass={cabinClass} />}
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Passengers</h2>
          <div className="space-y-3">
            {passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-gray-400">
                    DOB: {p.dob} · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                  </p>
                </div>
                {selectedSeats[i] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                    <p className="text-xs text-blue-600 font-semibold">Seat {selectedSeats[i]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        {addOns.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Add-ons</h2>
            <div className="space-y-2">
              {addOns.map(a => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{a.name}</span>
                  <span className="text-gray-900 font-medium">
                    ${a.perPassenger ? a.price * booking.passengersCount : a.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Base fare</span><span>${formatPrice(baseFare)}</span></div>
            {addOnsCost > 0 && <div className="flex justify-between text-gray-600"><span>Add-ons</span><span>${formatPrice(addOnsCost)}</span></div>}
            <div className="flex justify-between text-gray-600"><span>Taxes & fees</span><span>${formatPrice(taxes)}</span></div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total Paid</span>
              <span className="text-green-600">${formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => alert(`In a real app, this would download a PDF ticket.\n\nBooking Ref: ${pnr}`)}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Ticket
          </button>
          <Link
            href="/account"
            className="flex-1 border border-blue-300 text-blue-600 font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors text-center"
          >
            View My Trips
          </Link>
          <Link
            href="/"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors text-center"
          >
            Book Another Flight
          </Link>
        </div>
      </div>
    </div>
  )
}

function FlightDetailCard({ flight, label, cabinClass }: {
  flight: Flight
  label: string
  cabinClass: string
}) {
  return (
    <div className={label === 'Return' ? 'mt-4 pt-4 border-t border-gray-100' : ''}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{label}</p>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: flight.airline.color }}
        >
          {flight.airline.code}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900">
              {flight.origin.code} → {flight.destination.code}
            </span>
            <span className="text-xs text-gray-400">· {flight.flightNumber}</span>
          </div>
          <p className="text-xs text-gray-500">{flight.airline.name}</p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div>
              <p className="font-bold text-gray-900">{formatTime(flight.departureTime)}</p>
              <p className="text-xs text-gray-500">{flight.origin.city}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400">{formatDuration(flight.durationMinutes)}</p>
              <div className="h-0.5 bg-gray-200 mt-1" />
              <p className="text-xs text-gray-400 mt-0.5">
                {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{formatTime(flight.arrivalTime)}</p>
              <p className="text-xs text-gray-500">{flight.destination.city}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(flight.departureTime)}</span>
            <span>·</span>
            <span className="capitalize">{cabinClass}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
