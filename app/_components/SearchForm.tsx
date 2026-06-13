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

  const [tripType,    setTripType]    = useState<'oneWay' | 'roundTrip'>((defaultValues.tripType as 'oneWay' | 'roundTrip') || 'roundTrip')
  const [from,        setFrom]        = useState(defaultValues.from       || '')
  const [to,          setTo]          = useState(defaultValues.to         || '')
  const [date,        setDate]        = useState(defaultValues.date       || '')
  const [returnDate,  setReturnDate]  = useState(defaultValues.returnDate || '')
  const [passengers,  setPassengers]  = useState(defaultValues.passengers || 1)
  const [cabinClass,  setCabinClass]  = useState(defaultValues.cabinClass || 'economy')
  const [error,       setError]       = useState('')

  function swapAirports() { setFrom(to); setTo(from) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!from)                                         return setError('Please select a departure airport.')
    if (!to)                                           return setError('Please select a destination airport.')
    if (from === to)                                   return setError('Departure and destination cannot be the same.')
    if (!date)                                         return setError('Please select a departure date.')
    if (tripType === 'roundTrip' && !returnDate)       return setError('Please select a return date.')
    if (tripType === 'roundTrip' && returnDate < date) return setError('Return date must be after departure date.')
    const params = new URLSearchParams({
      from, to, date, passengers: String(passengers), cabinClass, tripType,
      ...(tripType === 'roundTrip' && returnDate ? { returnDate } : {}),
    })
    router.push(`/search?${params}`)
  }

  const inputCls = compact
    ? 'w-full border border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'
    : 'w-full border border-white/30 hover:border-white/60 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow'

  const labelCls = compact
    ? 'block text-xs font-semibold mb-1 text-gray-600'
    : 'block text-xs font-semibold mb-1.5 text-white/80 tracking-wide uppercase'

  // ── Non-compact (home page — sits on dark gradient) ──────────────────────
  if (!compact) {
    // Button col-span: roundTrip fills Row2 as [Pax][Class][Btn(2)]=4; oneWay as [Class][Btn(3)]=4
    const btnSpan = tripType === 'roundTrip' ? 'sm:col-span-2 lg:col-span-2' : 'sm:col-span-2 lg:col-span-3'

    return (
      <form onSubmit={handleSubmit} className="w-full">
        {/* Trip type toggle — always above the grid, never moves */}
        <div className="flex gap-2 mb-5">
          {(['roundTrip', 'oneWay'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTripType(t)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tripType === t ? 'bg-white text-blue-700 shadow-md' : 'border border-white/40 text-white/80 hover:bg-white/15 hover:border-white/60'
              }`}>
              {t === 'roundTrip' ? 'Round Trip' : 'One Way'}
            </button>
          ))}
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* From + swap + To */}
          <div className="flex items-end gap-2 sm:col-span-2">
            <div className="flex-1 min-w-0">
              <AirportPicker label="From" value={from} onChange={setFrom} placeholder="Departure city" excludeCode={to} dark />
            </div>
            <button type="button" onClick={swapAirports} title="Swap airports"
              className="mb-0.5 shrink-0 w-9 h-9 rounded-full bg-white hover:bg-blue-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <AirportPicker label="To" value={to} onChange={setTo} placeholder="Destination city" excludeCode={from} dark />
            </div>
          </div>

          {/* Depart */}
          <div>
            <label className={labelCls}>Depart</label>
            <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>

          {/* Return — only when roundTrip */}
          {tripType === 'roundTrip' ? (
            <div>
              <label className={labelCls}>Return</label>
              <input type="date" value={returnDate} min={date || today} onChange={e => setReturnDate(e.target.value)} className={inputCls} />
            </div>
          ) : (
            /* Passengers takes the Return slot when one-way */
            <div>
              <label className={labelCls}>Passengers</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className={inputCls}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
              </select>
            </div>
          )}

          {/* Passengers (roundTrip only — oneWay already shows it above) */}
          {tripType === 'roundTrip' && (
            <div>
              <label className={labelCls}>Passengers</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className={inputCls}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
              </select>
            </div>
          )}

          {/* Class */}
          <div>
            <label className={labelCls}>Class</label>
            <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className={inputCls}>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>

          {/* Search button — col-span changes to fill the row cleanly */}
          <div className={`flex items-end ${btnSpan}`}>
            <button type="submit"
              className="w-full font-bold py-2.5 px-6 rounded-xl text-sm text-white shadow-md active:scale-95 transition-all bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40">
              Search Flights
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-200 bg-red-500/20 border border-red-400/30 px-3 py-2 rounded-lg">{error}</p>}
      </form>
    )
  }

  // ── Compact (search results page — sits on white bg) ─────────────────────
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {/* From + swap + To */}
        <div className="flex items-end gap-2 col-span-2">
          <div className="flex-1 min-w-0">
            <AirportPicker label="From" value={from} onChange={setFrom} placeholder="Departure city" excludeCode={to} />
          </div>
          <button type="button" onClick={swapAirports} title="Swap"
            className="mb-0.5 shrink-0 w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <AirportPicker label="To" value={to} onChange={setTo} placeholder="Destination city" excludeCode={from} />
          </div>
        </div>

        {/* Depart */}
        <div>
          <label className={labelCls}>Depart</label>
          <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} className={inputCls} />
        </div>

        {/* Return */}
        {tripType === 'roundTrip' && (
          <div>
            <label className={labelCls}>Return</label>
            <input type="date" value={returnDate} min={date || today} onChange={e => setReturnDate(e.target.value)} className={inputCls} />
          </div>
        )}

        {/* Passengers */}
        <div>
          <label className={labelCls}>Pax</label>
          <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className={inputCls}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
          </select>
        </div>

        {/* Class */}
        <div>
          <label className={labelCls}>Class</label>
          <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className={inputCls}>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      {/* Button + trip type toggles — outside the grid so they never shift */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <button type="submit"
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-sm transition-colors shrink-0">
          Search Flights
        </button>
        <div className="flex gap-2">
          {(['roundTrip', 'oneWay'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTripType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                tripType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}>
              {t === 'roundTrip' ? 'Round Trip' : 'One Way'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
    </form>
  )
}
