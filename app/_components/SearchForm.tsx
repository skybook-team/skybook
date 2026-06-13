'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AirportPicker from './AirportPicker'

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
  const today  = new Date().toISOString().split('T')[0]

  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>(
    (defaultValues.tripType as 'oneWay' | 'roundTrip') || 'roundTrip'
  )
  const [from,        setFrom]        = useState(defaultValues.from        || '')
  const [to,          setTo]          = useState(defaultValues.to          || '')
  const [date,        setDate]        = useState(defaultValues.date        || '')
  const [returnDate,  setReturnDate]  = useState(defaultValues.returnDate  || '')
  const [passengers,  setPassengers]  = useState(defaultValues.passengers  || 1)
  const [cabinClass,  setCabinClass]  = useState(defaultValues.cabinClass  || 'economy')
  const [error,       setError]       = useState('')

  function swapAirports() {
    setFrom(to)
    setTo(from)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!from)                                       { setError('Please select a departure airport.');  return }
    if (!to)                                         { setError('Please select a destination airport.'); return }
    if (from === to)                                 { setError('Departure and destination cannot be the same.'); return }
    if (!date)                                       { setError('Please select a departure date.'); return }
    if (tripType === 'roundTrip' && !returnDate)     { setError('Please select a return date.'); return }
    if (tripType === 'roundTrip' && returnDate < date) { setError('Return date must be after departure date.'); return }

    const params = new URLSearchParams({
      from, to, date, passengers: String(passengers), cabinClass, tripType,
      ...(tripType === 'roundTrip' && returnDate ? { returnDate } : {}),
    })
    router.push(`/search?${params}`)
  }

  const inputClass = `w-full border rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${compact ? 'border-gray-300 hover:border-gray-400' : 'border-white/30 hover:border-white/60 shadow-sm'}`
  const labelClass = compact ? 'block text-xs font-semibold mb-1 text-gray-600' : 'block text-xs font-semibold mb-1.5 text-white/80 tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Trip type toggle (non-compact shows above the grid) */}
      {!compact && (
        <div className="flex gap-2 mb-5">
          {(['roundTrip', 'oneWay'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tripType === t
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'border border-white/40 text-white/80 hover:bg-white/15 hover:border-white/60'
              }`}
            >
              {t === 'roundTrip' ? 'Round Trip' : 'One Way'}
            </button>
          ))}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>

        {/* FROM + swap + TO */}
        <div className={`flex items-end gap-2 ${compact ? 'col-span-2' : 'sm:col-span-2'}`}>
          <div className="flex-1 min-w-0">
            <AirportPicker
              label="From"
              value={from}
              onChange={setFrom}
              placeholder="Departure city"
              excludeCode={to}
              dark={!compact}
            />
          </div>
          <button
            type="button"
            onClick={swapAirports}
            title="Swap airports"
            className="mb-0.5 flex-shrink-0 w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <AirportPicker
              label="To"
              value={to}
              onChange={setTo}
              placeholder="Destination city"
              excludeCode={from}
              dark={!compact}
            />
          </div>
        </div>

        {/* Depart */}
        <div>
          <label className={labelClass}>Depart</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={e => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Return */}
        {tripType === 'roundTrip' && (
          <div>
            <label className={labelClass}>Return</label>
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
          <label className={labelClass}>Passengers</label>
          <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className={inputClass}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </div>

        {/* Cabin class */}
        <div>
          <label className={labelClass}>Class</label>
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
            className={`w-full font-bold py-2.5 px-6 rounded-xl transition-all text-sm shadow-md active:scale-95 ${
              compact
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40'
            }`}
          >
            Search Flights
          </button>
        </div>
      </div>

      {/* Trip type toggle for compact mode */}
      {compact && (
        <div className="flex gap-2 mt-3">
          {(['roundTrip', 'oneWay'] as const).map(t => (
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
