'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateSeatMap,
  formatTime,
  formatDate,
  formatDuration,
  formatPrice,
  getPriceForClass,
  type Flight,
  type Passenger,
  type PendingBooking,
  type SeatRow,
  type SeatInfo,
  generatePNR,
} from '@/lib/data'
import { getPendingBooking, addBooking } from '@/lib/store'

export default function BookingFlow({ flightId }: { flightId: string }) {
  const router = useRouter()
  const [pending, setPending]     = useState<PendingBooking | null>(null)
  const [notFound, setNotFound]   = useState(false)

  // ── Passenger fields ──────────────────────────────────────────────────────
  const emptyPax = (): Passenger => ({ firstName: '', lastName: '', dob: '', gender: '', documentNumber: '' })
  const [pax, setPax]             = useState<Passenger[]>([emptyPax()])
  const [email, setEmail]         = useState('')

  // ── Seat fields ───────────────────────────────────────────────────────────
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [seatAddonCost, setSeatAddonCost] = useState(0)

  // ── Payment fields ────────────────────────────────────────────────────────
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry]         = useState('')
  const [cvv, setCvv]               = useState('')
  const [cardName, setCardName]     = useState('')

  // ── Submit state ──────────────────────────────────────────────────────────
  const [errors, setErrors]   = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const data = getPendingBooking(flightId)
    if (!data) { setNotFound(true); return }
    setPending(data)
    setPax(Array.from({ length: data.searchParams.passengers }, emptyPax))
  }, [flightId])

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Booking session not found or expired.</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
          Start a new search
        </button>
      </div>
    </div>
  )

  if (!pending) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { outboundFlight: flight, returnFlight, searchParams } = pending
  const { cabinClass, passengers: passengerCount } = searchParams

  const basePerPerson   = getPriceForClass(flight, cabinClass)
  const returnPerPerson = returnFlight ? getPriceForClass(returnFlight, cabinClass) : 0
  const baseFare        = (basePerPerson + returnPerPerson) * passengerCount
  const taxes           = Math.round(baseFare * 0.14 * 100) / 100
  const totalPrice      = baseFare + taxes + seatAddonCost

  // ── Seat map helpers ──────────────────────────────────────────────────────
  const seatMap: SeatRow[] = generateSeatMap(flight.id, cabinClass)

  function findSeat(code: string) {
    for (const r of seatMap) { const s = r.seats.find(s => s.code === code); if (s) return s }
    return null
  }

  function toggleSeat(code: string, taken: boolean) {
    if (taken) return
    setSelectedSeats(prev => {
      const next = prev.includes(code)
        ? prev.filter(s => s !== code)
        : prev.length >= passengerCount ? [...prev.slice(1), code] : [...prev, code]
      const cost = next.reduce((sum, c) => sum + (findSeat(c)?.price ?? 0), 0)
      setSeatAddonCost(cost)
      return next
    })
  }

  // ── Card formatting ───────────────────────────────────────────────────────
  function formatCard(val: string) { return val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
  function fmtExpiry(val: string) {
    const d = val.replace(/\D/g,'').slice(0,4)
    return d.length >= 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: string[] = []

    pax.forEach((p, i) => {
      const label = passengerCount > 1 ? `Passenger ${i + 1}` : 'Passenger'
      if (!p.firstName.trim()) errs.push(`${label}: First name required`)
      if (!p.lastName.trim())  errs.push(`${label}: Last name required`)
      if (!p.dob)              errs.push(`${label}: Date of birth required`)
      if (!p.gender)           errs.push(`${label}: Gender required`)
    })
    if (!email.trim() || !email.includes('@')) errs.push('Valid contact email required')
    if (cardNumber.replace(/\s/g,'').length < 16) errs.push('Enter a valid 16-digit card number')
    if (expiry.length < 5)  errs.push('Enter a valid expiry date (MM/YY)')
    if (cvv.length < 3)     errs.push('Enter a valid CVV')
    if (!cardName.trim())   errs.push('Name on card is required')

    setErrors(errs)
    if (errs.length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }

    setLoading(true)
    setTimeout(() => {
      const bookingId = crypto.randomUUID()
      addBooking({
        id: bookingId,
        pnr: generatePNR(),
        outboundFlight: flight,
        returnFlight: returnFlight ?? undefined,
        passengers: pax,
        selectedSeats,
        addOns: [],
        cabinClass,
        passengersCount: passengerCount,
        baseFare,
        addOnsCost: seatAddonCost,
        taxes,
        totalPrice,
        contactEmail: email,
        createdAt: new Date().toISOString(),
      })
      router.push(`/confirmation/${bookingId}`)
    }, 1800)
  }

  const colLabels = cabinClass === 'first' ? ['A', 'C', '', 'D', 'F'] : ['A', 'B', 'C', '', 'D', 'E', 'F']
  const selectedCost = selectedSeats.reduce((sum, c) => sum + (findSeat(c)?.price ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: flight.airline.color }}>
              {flight.airline.code}
            </span>
            <span className="font-medium text-gray-900">{flight.origin.code} → {flight.destination.code}</span>
            <span className="text-gray-400">·</span>
            <span>{formatDate(flight.departureTime)}</span>
            <span className="text-gray-400">·</span>
            <span>{formatTime(flight.departureTime)} – {formatTime(flight.arrivalTime)}</span>
            <span className="text-gray-400">·</span>
            <span className="capitalize">{cabinClass}</span>
            <span className="text-gray-400">·</span>
            <span>{passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Left: all sections ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm font-semibold text-red-700 mb-1">Please fix the following:</p>
                  {errors.map((e, i) => <p key={i} className="text-xs text-red-600">• {e}</p>)}
                </div>
              )}

              {/* ── Section 1: Traveler Info ── */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">1</div>
                  <h2 className="font-bold text-gray-900">Traveler Information</h2>
                </div>
                <div className="p-5">
                  {pax.map((p, i) => (
                    <div key={i} className={i > 0 ? 'mt-6 pt-6 border-t border-gray-100' : ''}>
                      {passengerCount > 1 && (
                        <p className="text-sm font-semibold text-blue-600 mb-3">Passenger {i + 1}</p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                          <input type="text" value={p.firstName}
                            onChange={e => setPax(prev => prev.map((x, idx) => idx === i ? { ...x, firstName: e.target.value } : x))}
                            placeholder="John" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                          <input type="text" value={p.lastName}
                            onChange={e => setPax(prev => prev.map((x, idx) => idx === i ? { ...x, lastName: e.target.value } : x))}
                            placeholder="Smith" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
                          <input type="date" value={p.dob}
                            onChange={e => setPax(prev => prev.map((x, idx) => idx === i ? { ...x, dob: e.target.value } : x))}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
                          <select value={p.gender}
                            onChange={e => setPax(prev => prev.map((x, idx) => idx === i ? { ...x, gender: e.target.value } : x))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="X">Non-binary / Other</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Passport / ID Number</label>
                          <input type="text" value={p.documentNumber}
                            onChange={e => setPax(prev => prev.map((x, idx) => idx === i ? { ...x, documentNumber: e.target.value } : x))}
                            placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Contact Information</p>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <p className="text-xs text-gray-400 mt-1">Your booking confirmation will be sent here.</p>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Seat Selection ── */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h2 className="font-bold text-gray-900">Seat Selection <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
                    <p className="text-xs text-gray-400 mt-0.5">Skip to auto-assign a seat at check-in</p>
                  </div>
                </div>
                <div className="p-5">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded bg-gray-200" />Taken</div>
                    <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded bg-blue-600" />Selected</div>
                    {cabinClass === 'economy' ? (
                      <>
                        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded border-2 border-teal-400 bg-teal-50 text-teal-700 text-[9px] font-bold flex items-center justify-center">25</div>Extra legroom</div>
                        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-600 text-[9px] font-medium flex items-center justify-center">15</div>Window (+$15)</div>
                        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-600 text-[9px] font-medium flex items-center justify-center">12</div>Aisle (+$12)</div>
                        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-400 text-[9px] flex items-center justify-center">–</div>Middle (free)</div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded border border-gray-300 bg-white text-gray-600 text-[9px] font-medium flex items-center justify-center">{cabinClass === 'business' ? '20' : '40'}</div>Seat fee per seat</div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-max mx-auto" style={{ maxWidth: 340 }}>
                      <div className="flex items-center justify-center gap-1 mb-2 ml-8">
                        {colLabels.map((c, i) => (
                          <div key={i} className={`w-7 text-center text-xs font-medium text-gray-400 ${c === '' ? 'w-3' : ''}`}>{c}</div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {seatMap.map(({ row, seats }) => (
                          <div key={row} className="flex items-center gap-1">
                            <div className="w-7 text-right text-xs text-gray-400 pr-1 shrink-0">{row}</div>
                            {(cabinClass === 'first'
                              ? seats.map(s => (
                                  <SeatCell key={s.code} seat={s} selected={selectedSeats.includes(s.code)} onClick={() => toggleSeat(s.code, s.taken)} />
                                )).reduce<React.ReactNode[]>((acc, el, i) => { if (i === 2) acc.push(<div key="aisle" className="w-3" />); acc.push(el); return acc }, [])
                              : seats.map(s => (
                                  <SeatCell key={s.code} seat={s} selected={selectedSeats.includes(s.code)} onClick={() => toggleSeat(s.code, s.taken)} />
                                )).reduce<React.ReactNode[]>((acc, el, i) => { if (i === 3) acc.push(<div key="aisle" className="w-3" />); acc.push(el); return acc }, [])
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Selected: <span className="font-semibold text-blue-600">{selectedSeats.join(', ')}</span></p>
                      {selectedCost > 0 && <p className="text-xs text-gray-500 mt-0.5">Seat fee: <span className="font-semibold">${selectedCost}</span></p>}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section 3: Payment ── */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">3</div>
                  <h2 className="font-bold text-gray-900">Payment Details</h2>
                  {/* Card logos */}
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-7 px-2 rounded border border-gray-200 bg-white flex items-center justify-center">
                      <span className="text-[11px] font-black" style={{color:'#1434CB',letterSpacing:'-0.5px'}}>VISA</span>
                    </div>
                    <div className="h-7 px-1.5 rounded border border-gray-200 bg-white flex items-center gap-0.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90" />
                      <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 opacity-90 -ml-1.5" />
                    </div>
                    <div className="h-7 px-2 rounded border border-gray-200 bg-[#016FD0] flex items-center">
                      <span className="text-[9px] font-black text-white tracking-tight">AMEX</span>
                    </div>
                    <div className="h-7 px-2 rounded border border-gray-200 bg-white flex items-center gap-1">
                      <span className="text-[9px] font-black text-gray-700 tracking-tight">DISC</span>
                      <div className="w-3 h-3 rounded-full bg-orange-400" />
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="text-xs font-bold text-green-800">Secure Checkout</p>
                      <p className="text-[11px] text-green-700">Protected by 256-bit SSL encryption</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Card Number *</label>
                    <input type="text" inputMode="numeric" value={cardNumber}
                      onChange={e => setCardNumber(formatCard(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Expiry *</label>
                      <input type="text" inputMode="numeric" value={expiry}
                        onChange={e => setExpiry(fmtExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CVV *</label>
                      <input type="text" inputMode="numeric" value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name on Card *</label>
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[{ icon: '🔒', label: '256-bit SSL' }, { icon: '✅', label: 'PCI DSS Level 1' }, { icon: '🛡️', label: 'SOC 2 Certified' }].map(b => (
                      <div key={b.label} className="p-2 bg-gray-50 rounded-lg text-center border border-gray-100">
                        <div className="text-base mb-0.5">{b.icon}</div>
                        <p className="text-[10px] font-semibold text-gray-600">{b.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Pay button ── */}
              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl text-base transition-colors disabled:opacity-75 flex items-center justify-center gap-3 shadow-lg shadow-green-600/30">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing your booking…</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Pay ${formatPrice(totalPrice)} &amp; Confirm Booking</>
                )}
              </button>
            </div>

            {/* ── Right: Itinerary sidebar ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 sticky top-24 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                  <p className="text-white font-bold text-sm">Your Itinerary</p>
                  <p className="text-blue-200 text-xs mt-0.5">
                    {returnFlight ? 'Round Trip' : 'One Way'} · {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'} · <span className="capitalize">{cabinClass}</span>
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <FlightMini flight={flight} cabinClass={cabinClass} label="Outbound" />
                  {returnFlight && <FlightMini flight={returnFlight} cabinClass={cabinClass} label="Return" />}

                  {selectedSeats.length > 0 && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Selected Seats</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedSeats.join(', ')}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Price Breakdown</p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Base fare × {passengerCount}</span>
                      <span>${formatPrice(baseFare)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Taxes &amp; fees (14%)</span>
                      <span>${formatPrice(taxes)}</span>
                    </div>
                    {seatAddonCost > 0 && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Seat selection</span>
                        <span>+${formatPrice(seatAddonCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                      <span className="text-sm">Total</span>
                      <span className="text-blue-600 text-base">${formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Secure booking · No hidden fees
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

function FlightMini({ flight, cabinClass, label }: { flight: Flight; cabinClass: 'economy'|'business'|'first'; label: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[9px] shrink-0"
            style={{ backgroundColor: flight.airline.color }}>
            {flight.airline.code}
          </div>
          <span className="text-[11px] font-semibold text-gray-700">{flight.flightNumber}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-center">
          <p className="text-base font-black text-gray-900 leading-none">{formatTime(flight.departureTime)}</p>
          <p className="text-xs font-bold text-gray-500 mt-0.5">{flight.origin.code}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-gray-400">{formatDuration(flight.durationMinutes)}</p>
          <div className="flex items-center my-0.5">
            <div className="flex-1 h-px bg-gray-300" />
            {flight.stops > 0 && <div className="w-1.5 h-1.5 rounded-full border border-gray-400 bg-white shrink-0 mx-0.5" />}
            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <p className="text-[10px] text-gray-400">
            {flight.stops === 0 ? <span className="text-green-600 font-medium">Nonstop</span> : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}${flight.stopCity ? ` · ${flight.stopCity}` : ''}`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-base font-black text-gray-900 leading-none">{formatTime(flight.arrivalTime)}</p>
          <p className="text-xs font-bold text-gray-500 mt-0.5">{flight.destination.code}</p>
        </div>
      </div>
      <div className="mt-2.5 pt-2 border-t border-gray-200 space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-400">{formatDate(flight.departureTime)}</span>
          <span className="text-gray-500 font-medium">{flight.aircraft}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className={flight.carryOnIncluded ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {flight.carryOnIncluded ? '✓ Carry-on' : '✗ Carry-on'}
          </span>
          <span className={flight.checkedBagPrice === null ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {flight.checkedBagPrice === null ? '✓ 1st bag free' : `Bag +$${flight.checkedBagPrice}`}
          </span>
        </div>
        <div className="text-[11px] text-gray-400 capitalize">{cabinClass} · ${formatPrice(getPriceForClass(flight, cabinClass))} / person</div>
      </div>
    </div>
  )
}

function SeatCell({ seat, selected, onClick }: { seat: SeatInfo; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={seat.taken}
      title={`${seat.code}${seat.price > 0 ? ` +$${seat.price}` : ' Free'}`}
      className={`w-7 h-7 rounded text-[9px] font-semibold transition-colors ${
        seat.taken ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : selected  ? 'bg-blue-600 text-white'
        : seat.extraLegroom ? 'border-2 border-teal-400 bg-teal-50 text-teal-700 hover:bg-teal-100'
        : 'bg-white border border-gray-300 text-gray-500 hover:border-blue-400 hover:bg-blue-50'
      }`}>
      {selected ? '✓' : seat.taken ? '' : seat.price > 0 ? String(seat.price) : '–'}
    </button>
  )
}
