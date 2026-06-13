'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateFlights, formatTime, formatDate, formatDuration,
  getPriceForClass, AIRPORTS, AIRLINES, type Flight, type SearchParams,
} from '@/lib/data'
import { setPendingBooking } from '@/lib/store'

interface Props {
  from: string; to: string; date: string; returnDate?: string
  passengers: number; cabinClass: 'economy' | 'business' | 'first'; tripType: 'oneWay' | 'roundTrip'
}
type SortKey = 'best' | 'cheapest' | 'fastest' | 'earliest'

export default function SearchResults({ from, to, date, returnDate, passengers, cabinClass, tripType }: Props) {
  const router = useRouter()
  const [sort, setSort] = useState<SortKey>('best')
  const [stopFilter, setStopFilter] = useState<'any' | '0' | '1'>('any')
  const [maxPrice, setMaxPrice] = useState(9999)
  const [airlineFilter, setAirlineFilter] = useState<Set<string>>(new Set())
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null)
  const [timeFilter, setTimeFilter] = useState<'any' | 'morning' | 'afternoon' | 'evening'>('any')

  const outboundFlights = useMemo(() => generateFlights(from, to, date), [from, to, date])
  const returnFlights   = useMemo(() =>
    tripType === 'roundTrip' && returnDate ? generateFlights(to, from, returnDate) : [],
    [to, from, returnDate, tripType])

  const fromAirport = AIRPORTS.find(a => a.code === from)
  const toAirport   = AIRPORTS.find(a => a.code === to)

  const allPrices = outboundFlights.map(f => getPriceForClass(f, cabinClass))
  const cheapestPrice = Math.min(...allPrices)
  const maxPossible   = Math.max(...allPrices, 500)

  function depHour(f: Flight) { return new Date(f.departureTime).getHours() }

  function applyFilters(flights: Flight[]): Flight[] {
    return flights.filter(f => {
      const price = getPriceForClass(f, cabinClass)
      if (stopFilter === '0' && f.stops !== 0) return false
      if (stopFilter === '1' && f.stops > 1)   return false
      if (price > maxPrice) return false
      if (airlineFilter.size > 0 && !airlineFilter.has(f.airline.code)) return false
      const h = depHour(f)
      if (timeFilter === 'morning'   && !(h >= 5  && h < 12)) return false
      if (timeFilter === 'afternoon' && !(h >= 12 && h < 17)) return false
      if (timeFilter === 'evening'   && !(h >= 17 && h < 24)) return false
      return true
    })
  }

  function sortFlights(flights: Flight[]): Flight[] {
    return [...flights].sort((a, b) => {
      const pa = getPriceForClass(a, cabinClass), pb = getPriceForClass(b, cabinClass)
      if (sort === 'cheapest') return pa - pb
      if (sort === 'fastest')  return a.durationMinutes - b.durationMinutes
      if (sort === 'earliest') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      // best = balance price + duration
      return (pa + a.durationMinutes * 0.4) - (pb + b.durationMinutes * 0.4)
    })
  }

  const filteredOut = sortFlights(applyFilters(outboundFlights))
  const filteredRet = sortFlights(applyFilters(returnFlights))
  const showReturn  = tripType === 'roundTrip' && selectedOutbound

  if (!from || !to || !date) return (
    <div className="text-center py-20 text-gray-400">Enter a search above to find flights.</div>
  )

  function selectFlight(outbound: Flight, ret?: Flight) {
    const id = crypto.randomUUID()
    setPendingBooking({ id, outboundFlight: outbound, returnFlight: ret, searchParams: { from, to, date, returnDate, passengers, cabinClass, tripType } as SearchParams })
    router.push(`/booking/${id}`)
  }

  function toggleAirline(code: string) {
    setAirlineFilter(prev => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n })
  }

  const presentAirlines = [...new Set(outboundFlights.map(f => f.airline.code))]
    .map(code => AIRLINES.find(a => a.code === code)!)
    .filter(Boolean)

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ── Filters ── */}
      <aside className="w-full lg:w-60 shrink-0 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Filter Results</h3>

          {/* Stops */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stops</p>
            <div className="flex gap-2">
              {([['any','Any'],['0','Nonstop'],['1','1 Stop']] as const).map(([v,l]) => (
                <button key={v} onClick={() => setStopFilter(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${stopFilter === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Departure time */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Departure</p>
            <div className="grid grid-cols-2 gap-1.5">
              {([['any','Any time',''],['morning','Morning','5am–12pm'],['afternoon','Afternoon','12–5pm'],['evening','Evening','5pm–12am']] as const).map(([v,l,sub]) => (
                <button key={v} onClick={() => setTimeFilter(v)}
                  className={`py-2 px-1 rounded-lg border text-xs transition-colors ${timeFilter === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  <span className="font-semibold block">{l}</span>
                  {sub && <span className="text-xs opacity-70">{sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Price</p>
              <p className="text-xs font-bold text-blue-600">{maxPrice >= maxPossible ? 'Any' : `$${maxPrice}`}</p>
            </div>
            <input type="range" min={cheapestPrice} max={maxPossible} step={5} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>${cheapestPrice}</span><span>${maxPossible}+</span></div>
          </div>

          {/* Airlines */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Airlines</p>
            <div className="space-y-1.5">
              {presentAirlines.map(a => (
                <label key={a.code} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={airlineFilter.has(a.code)} onChange={() => toggleAirline(a.code)}
                    className="rounded border-gray-300 text-blue-600" />
                  <div className="w-5 h-5 rounded overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.logoUrl} alt={a.name} className="w-4 h-4 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-gray-900">{a.name.replace(' Air Lines','').replace(' Airlines','').replace(' Airways','')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Results ── */}
      <div className="flex-1 min-w-0">
        {showReturn ? (
          <>
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-800">Outbound selected — now pick your return</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  {selectedOutbound!.airline.name} · {selectedOutbound!.flightNumber} · {formatTime(selectedOutbound!.departureTime)} → {formatTime(selectedOutbound!.arrivalTime)}
                </p>
              </div>
              <button onClick={() => setSelectedOutbound(null)} className="text-xs text-blue-600 border border-blue-300 px-3 py-1 rounded-lg hover:bg-blue-100">Change</button>
            </div>
            <FlightList flights={filteredRet} cabinClass={cabinClass} passengers={passengers}
              sort={sort} onSortChange={setSort}
              onSelect={ret => selectFlight(selectedOutbound!, ret)}
              label={`${to} → ${from} · Return · ${returnDate}`}
              cheapest={Math.min(...filteredRet.map(f => getPriceForClass(f, cabinClass)))} />
          </>
        ) : (
          <FlightList flights={filteredOut} cabinClass={cabinClass} passengers={passengers}
            sort={sort} onSortChange={setSort}
            onSelect={f => tripType === 'oneWay' ? selectFlight(f) : setSelectedOutbound(f)}
            label={`${fromAirport?.city} (${from}) → ${toAirport?.city} (${to}) · ${date}`}
            cheapest={cheapestPrice} />
        )}
      </div>
    </div>
  )
}

// ── Flight list with sort bar ──────────────────────────────────────────────

function FlightList({ flights, cabinClass, passengers, sort, onSortChange, onSelect, label, cheapest }: {
  flights: Flight[]; cabinClass: 'economy'|'business'|'first'; passengers: number
  sort: SortKey; onSortChange: (s: SortKey) => void; onSelect: (f: Flight) => void
  label: string; cheapest: number
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
          <p className="text-xs text-gray-400">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Sort:</span>
          {(['best','cheapest','fastest','earliest'] as SortKey[]).map(s => (
            <button key={s} onClick={() => onSortChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${sort === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {flights.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
          <p className="text-3xl mb-3">✈️</p>
          <p className="font-semibold text-gray-700 mb-1">No flights match your filters</p>
          <p className="text-gray-400 text-sm">Try adjusting the stops, price, or departure time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map((f, idx) => (
            <FlightCard key={f.id} flight={f} cabinClass={cabinClass} passengers={passengers}
              onSelect={onSelect} isCheapest={idx === 0 && getPriceForClass(f, cabinClass) === cheapest} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Single flight card ─────────────────────────────────────────────────────

function FlightCard({ flight, cabinClass, passengers, onSelect, isCheapest }: {
  flight: Flight; cabinClass: 'economy'|'business'|'first'; passengers: number
  onSelect: (f: Flight) => void; isCheapest: boolean
}) {
  const price = getPriceForClass(flight, cabinClass)
  const classData = flight[cabinClass]
  const dep = new Date(flight.departureTime)
  const arr = new Date(flight.arrivalTime)
  const nextDay = arr.getDate() !== dep.getDate()
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border transition-all hover:shadow-lg group ${isCheapest ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}>
      {isCheapest && (
        <div className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-t-2xl flex items-center gap-1.5">
          <span>★</span> Lowest fare for this route
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-4">

          {/* Airline logo + name */}
          <div className="w-14 shrink-0 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden mb-1">
              {!imgFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={flight.airline.logoUrl} alt={flight.airline.name} className="w-9 h-9 object-contain"
                  onError={() => setImgFailed(true)} />
              ) : (
                <span className="text-xs font-black" style={{ color: flight.airline.color }}>{flight.airline.code}</span>
              )}
            </div>
          </div>

          {/* Times + route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Departure */}
              <div className="text-center sm:text-left shrink-0">
                <p className="text-xl font-black text-gray-900 leading-none">{formatTime(dep.toISOString())}</p>
                <p className="text-sm font-bold text-gray-500 mt-0.5">{flight.origin.code}</p>
                <p className="text-xs text-gray-400 hidden sm:block">{flight.origin.city}</p>
              </div>

              {/* Duration bar */}
              <div className="flex-1 min-w-0 px-1">
                <p className="text-xs text-gray-400 text-center mb-1">{formatDuration(flight.durationMinutes)}</p>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-px bg-gray-300" />
                  {flight.stops > 0 && <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-white shrink-0" />}
                  {flight.stops > 1 && <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-white shrink-0" />}
                  <svg className="w-3 h-3 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
                <p className="text-xs text-center mt-1 font-medium">
                  {flight.stops === 0
                    ? <span className="text-green-600">Nonstop</span>
                    : <span className="text-gray-500">{flight.stops} stop{flight.stops > 1 ? 's' : ''}{flight.stopCity ? ` · ${flight.stopCity}` : ''}</span>}
                </p>
              </div>

              {/* Arrival */}
              <div className="text-center sm:text-right shrink-0">
                <p className="text-xl font-black text-gray-900 leading-none">
                  {formatTime(arr.toISOString())}
                  {nextDay && <sup className="text-xs text-orange-400 ml-0.5 font-normal">+1</sup>}
                </p>
                <p className="text-sm font-bold text-gray-500 mt-0.5">{flight.destination.code}</p>
                <p className="text-xs text-gray-400 hidden sm:block">{flight.destination.city}</p>
              </div>
            </div>

            {/* Flight meta */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{flight.airline.name}</span>
              <span>·</span>
              <span>{flight.flightNumber}</span>
              <span>·</span>
              <span>{flight.aircraft}</span>
              <span>·</span>
              <span className="capitalize">{cabinClass}</span>
            </div>

            {/* Baggage */}
            <div className="mt-1.5 flex items-center gap-3 text-xs">
              <span className={flight.carryOnIncluded ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {flight.carryOnIncluded ? '✓' : '✗'} Carry-on
              </span>
              <span className={flight.checkedBagPrice === null ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {flight.checkedBagPrice === null ? '✓ 1st bag free' : `✗ Bag +$${flight.checkedBagPrice}`}
              </span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="text-right shrink-0 ml-1">
            <p className="text-2xl font-black text-gray-900">${price}</p>
            <p className="text-xs text-gray-400 mb-1">{passengers > 1 ? `$${price * passengers} total` : 'per person'}</p>
            {classData.seatsLeft <= 5 && (
              <p className="text-xs text-red-500 font-semibold mb-1">{classData.seatsLeft} seats left!</p>
            )}
            <button
              onClick={() => onSelect(flight)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors w-full"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      {/* Bottom meta */}
      <div className="border-t border-gray-100 px-5 py-2 flex items-center justify-between text-xs text-gray-400">
        <span>{formatDate(flight.departureTime)}</span>
        {isCheapest && <span className="text-blue-600 font-semibold">Best value</span>}
      </div>
    </div>
  )
}
