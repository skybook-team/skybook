'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AIRPORTS } from '@/lib/data'

interface SearchFormProps {
  compact?: boolean
  defaultValues?: {
    from?: string
    to?: string
    date?: string
    returnDate?: string
    passengers?: number
    cabinClass?: string
    tripType?: string
  }
}

export default function SearchForm({ compact = false, defaultValues = {} }: SearchFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>(
    (defaultValues.tripType as 'oneWay' | 'roundTrip') || 'roundTrip'
  )
  const [from, setFrom] = useState(defaultValues.from || '')
  const [to, setTo] = useState(defaultValues.to || '')
  const [date, setDate] = useState(defaultValues.date || '')
  const [returnDate, setReturnDate] = useState(defaultValues.returnDate || '')
  const [passengers, setPassengers] = useState(defaultValues.passengers || 1)
  const [cabinClass, setCabinClass] = useState(defaultValues.cabinClass || 'economy')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!from) { setError('Please select a departure airport.'); return }
    if (!to) { setError('Please select a destination airport.'); return }
    if (from === to) { setError('Departure and destination cannot be the same.'); return }
    if (!date) { setError('Please select a departure date.'); return }
    if (tripType === 'roundTrip' && !returnDate) { setError('Please select a return date.'); return }
    if (tripType === 'roundTrip' && returnDate < date) { setError('Return date must be after departure date.'); return }

    const params = new URLSearchParams({
      from, to, date, passengers: String(passengers), cabinClass, tripType,
      ...(tripType === 'roundTrip' && returnDate ? { returnDate } : {}),
    })
    router.push(`/search?${params}`)
  }

  const inputClass = `w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Trip type toggle */}
      {!compact && (
        <div className="flex gap-1 mb-4">
          {(['roundTrip', 'oneWay'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tripType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t === 'roundTrip' ? 'Round Trip' : 'One Way'}
            </button>
          ))}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* From */}
        <div className={compact ? '' : 'sm:col-span-1'}>
          <label className={`block text-xs font-semibold mb-1 ${compact ? 'text-gray-600' : 'text-white/80'}`}>From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className={inputClass}>
            <option value="">Select airport</option>
            {AIRPORTS.map(a => (
              <option key={a.code} value={a.code}>{a.code} – {a.city}</option>
            ))}
          </select>
        </div>

        {/* To */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${compact ? 'text-gray-600' : 'text-white/80'}`}>To</label>
          <select value={to} onChange={e => setTo(e.target.value)} className={inputClass}>
            <option value="">Select airport</option>
            {AIRPORTS.filter(a => a.code !== from).map(a => (
              <option key={a.code} value={a.code}>{a.code} – {a.city}</option>
            ))}
          </select>
        </div>

        {/* Depart */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${compact ? 'text-gray-600' : 'text-white/80'}`}>Depart</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={e => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Return (only round trip) */}
        {tripType === 'roundTrip' && (
          <div>
            <label className={`block text-xs font-semibold mb-1 ${compact ? 'text-gray-600' : 'text-white/80'}`}>Return</label>
            <input
              type="date"
              value={returnDate}
              min={date || today}
              onChange={e => setReturnDate(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {/* Passengers */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${compact ? 'text-gray-600' : 'text-white/80'}`}>Passengers</label>
          <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className={inputClass}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </div>

        {/* Cabin class */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${compact ? 'text-gray-600' : 'text-white/80'}`}>Class</label>
          <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className={inputClass}>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>

        {/* Search button */}
        <div className={`flex items-end ${compact ? '' : 'sm:col-span-2 lg:col-span-4 mt-1'}`}>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Search Flights
          </button>
        </div>
      </div>

      {/* Trip type toggle for compact */}
      {compact && (
        <div className="flex gap-2 mt-3">
          {(['roundTrip', 'oneWay'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                tripType === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {t === 'roundTrip' ? 'Round Trip' : 'One Way'}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </form>
  )
}
