'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateFlights,
  formatTime,
  formatDate,
  formatDuration,
  getPriceForClass,
  AIRPORTS,
  type Flight,
  type SearchParams,
} from '@/lib/data'
import { setPendingBooking } from '@/lib/store'

interface SearchResultsProps {
  from: string
  to: string
  date: string
  returnDate?: string
  passengers: number
  cabinClass: 'economy' | 'business' | 'first'
  tripType: 'oneWay' | 'roundTrip'
}

type SortKey = 'best' | 'cheapest' | 'fastest' | 'earliest'

export default function SearchResults({
  from, to, date, returnDate, passengers, cabinClass, tripType,
}: SearchResultsProps) {
  const router = useRouter()
  const [sort, setSort] = useState<SortKey>('best')
  const [filterStops, setFilterStops] = useState<Set<number>>(new Set([0, 1, 2]))
  const [maxPrice, setMaxPrice] = useState<number>(2000)
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null)

  const outboundFlights = useMemo(() => generateFlights(from, to, date), [from, to, date])
  const returnFlights = useMemo(
    () => (tripType === 'roundTrip' && returnDate ? generateFlights(to, from, returnDate) : []),
    [to, from, returnDate, tripType]
  )

  const fromAirport = AIRPORTS.find(a => a.code === from)
  const toAirport = AIRPORTS.find(a => a.code === to)

  const pricesAll = outboundFlights.map(f => getPriceForClass(f, cabinClass))
  const maxPossiblePrice = Math.max(...pricesAll, 500)

  function sortFlights(flights: Flight[]): Flight[] {
    const scored = flights.map(f => {
      const price = getPriceForClass(f, cabinClass)
      const dep = new Date(f.departureTime).getTime()
      return { f, price, dep }
    })
    switch (sort) {
      case 'cheapest': return scored.sort((a, b) => a.price - b.price).map(s => s.f)
      case 'fastest': return scored.sort((a, b) => a.f.durationMinutes - b.f.durationMinutes).map(s => s.f)
      case 'earliest': return scored.sort((a, b) => a.dep - b.dep).map(s => s.f)
      case 'best':
      default: return scored.sort((a, b) => (a.price + a.f.durationMinutes * 0.5) - (b.price + b.f.durationMinutes * 0.5)).map(s => s.f)
    }
  }

  const filteredOutbound = sortFlights(
    outboundFlights.filter(f =>
      filterStops.has(f.stops) && getPriceForClass(f, cabinClass) <= maxPrice
    )
  )
  const filteredReturn = sortFlights(
    returnFlights.filter(f =>
      filterStops.has(f.stops) && getPriceForClass(f, cabinClass) <= maxPrice
    )
  )

  if (!from || !to || !date) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Please enter a search above to find flights.</p>
      </div>
    )
  }

  function handleSelectOutbound(flight: Flight) {
    if (tripType === 'oneWay') {
      bookFlight(flight, undefined)
    } else {
      setSelectedOutbound(flight)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleSelectReturn(returnFlight: Flight) {
    if (!selectedOutbound) return
    bookFlight(selectedOutbound, returnFlight)
  }

  function bookFlight(outbound: Flight, ret: Flight | undefined) {
    const id = crypto.randomUUID()
    const searchParams: SearchParams = {
      from, to, date, returnDate, passengers, cabinClass, tripType,
    }
    setPendingBooking({ id, outboundFlight: outbound, returnFlight: ret, searchParams })
    router.push(`/booking/${id}`)
  }

  function toggleStop(n: number) {
    setFilterStops(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const showingReturn = tripType === 'roundTrip' && selectedOutbound

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Filters</h3>

          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Stops</p>
            {[0, 1, 2].map(n => (
              <label key={n} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterStops.has(n)}
                  onChange={() => toggleStop(n)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {n === 0 ? 'Nonstop' : n === 1 ? '1 Stop' : '2+ Stops'}
                </span>
              </label>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Max Price <span className="text-blue-600 font-bold">${maxPrice}</span>
            </p>
            <input
              type="range"
              min={80}
              max={maxPossiblePrice}
              step={10}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$80</span>
              <span>${maxPossiblePrice}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {showingReturn ? (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-800">Outbound selected — now choose your return flight</p>
                <p className="text-xs text-blue-600">{selectedOutbound!.airline.name} · {selectedOutbound!.flightNumber} · {formatTime(selectedOutbound!.departureTime)} → {formatTime(selectedOutbound!.arrivalTime)}</p>
              </div>
              <button onClick={() => setSelectedOutbound(null)} className="text-xs text-blue-600 hover:underline">Change</button>
            </div>
            <FlightList
              flights={filteredReturn}
              cabinClass={cabinClass}
              passengers={passengers}
              sort={sort}
              onSortChange={setSort}
              onSelect={handleSelectReturn}
              label={`${to} → ${from} · Return · ${returnDate}`}
            />
          </>
        ) : (
          <FlightList
            flights={filteredOutbound}
            cabinClass={cabinClass}
            passengers={passengers}
            sort={sort}
            onSortChange={setSort}
            onSelect={handleSelectOutbound}
            label={`${from} → ${to} · ${fromAirport?.city} to ${toAirport?.city} · ${date}`}
          />
        )}
      </div>
    </div>
  )
}

function FlightList({
  flights, cabinClass, passengers, sort, onSortChange, onSelect, label,
}: {
  flights: Flight[]
  cabinClass: 'economy' | 'business' | 'first'
  passengers: number
  sort: SortKey
  onSortChange: (s: SortKey) => void
  onSelect: (f: Flight) => void
  label: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{flights.length} flights found</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Sort:</span>
          {(['best', 'cheapest', 'fastest', 'earliest'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                sort === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {flights.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No flights match your filters. Try adjusting the price or stop filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map(flight => (
            <FlightCard
              key={flight.id}
              flight={flight}
              cabinClass={cabinClass}
              passengers={passengers}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FlightCard({
  flight, cabinClass, passengers, onSelect,
}: {
  flight: Flight
  cabinClass: 'economy' | 'business' | 'first'
  passengers: number
  onSelect: (f: Flight) => void
}) {
  const price = getPriceForClass(flight, cabinClass)
  const classData = flight[cabinClass]
  const total = price * passengers
  const dep = new Date(flight.departureTime)
  const arr = new Date(flight.arrivalTime)
  const nextDay = arr.getDate() !== dep.getDate()

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-4 sm:p-5">
      <div className="flex items-center gap-4">
        {/* Airline badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: flight.airline.color }}
        >
          {flight.airline.code}
        </div>

        {/* Flight info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-gray-400">{flight.airline.name}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{flight.flightNumber}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 leading-none">{formatTime(flight.departureTime)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{flight.origin.code}</p>
            </div>

            {/* Duration / stops indicator */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <div className="h-0.5 flex-1 bg-gray-200" />
                {flight.stops > 0 && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {flight.stops > 1 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 ml-1" />}
                  </>
                )}
                <div className="h-0.5 flex-1 bg-gray-200" />
                {/* Arrow */}
                <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-center text-xs text-gray-500 mt-0.5 truncate">
                {formatDuration(flight.durationMinutes)}
                {flight.stops === 0 && <span className="text-green-600 font-medium"> · Nonstop</span>}
                {flight.stops === 1 && flight.stopCity && <span> · 1 stop {flight.stopCity}</span>}
                {flight.stops === 2 && <span> · 2 stops</span>}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 leading-none">
                {formatTime(flight.arrivalTime)}
                {nextDay && <sup className="text-xs text-orange-500 ml-0.5">+1</sup>}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{flight.destination.code}</p>
            </div>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="text-right shrink-0 ml-2">
          <p className="text-2xl font-bold text-gray-900">${price}</p>
          <p className="text-xs text-gray-400">per person</p>
          {passengers > 1 && <p className="text-xs text-gray-500">${total} total</p>}
          {classData.seatsLeft <= 5 && (
            <p className="text-xs text-red-500 font-medium mt-0.5">{classData.seatsLeft} left!</p>
          )}
          <button
            onClick={() => onSelect(flight)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors w-full"
          >
            Select
          </button>
        </div>
      </div>

      {/* Date row */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-400">
        <span>{formatDate(flight.departureTime)}</span>
        <span className="capitalize">{cabinClass}</span>
      </div>
    </div>
  )
}
