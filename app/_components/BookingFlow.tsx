'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateSeatMap,
  formatTime,
  formatDate,
  formatDuration,
  getPriceForClass,
  ADD_ONS,
  type Flight,
  type Passenger,
  type AddOn,
  type PendingBooking,
  type SeatRow,
  generatePNR,
} from '@/lib/data'
import { getPendingBooking, addBooking } from '@/lib/store'

type Step = 'passengers' | 'seats' | 'addons' | 'payment'

const STEPS: { key: Step; label: string }[] = [
  { key: 'passengers', label: 'Traveler Info' },
  { key: 'seats', label: 'Seat Selection' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'payment', label: 'Payment' },
]

export default function BookingFlow({ flightId }: { flightId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<PendingBooking | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<Step>('passengers')
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [contactEmail, setContactEmail] = useState('')
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([])

  useEffect(() => {
    const data = getPendingBooking(flightId)
    if (!data) { setNotFound(true); return }
    setPending(data)
  }, [flightId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Booking session not found or expired.</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Start a new search
          </button>
        </div>
      </div>
    )
  }

  if (!pending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { outboundFlight: flight, returnFlight, searchParams } = pending
  const { cabinClass, passengers: passengerCount } = searchParams

  const basePerPerson = getPriceForClass(flight, cabinClass)
  const returnPerPerson = returnFlight ? getPriceForClass(returnFlight, cabinClass) : 0
  const addOnsCost = selectedAddOns.reduce((sum, a) => sum + (a.perPassenger ? a.price * passengerCount : a.price), 0)
  const baseFare = (basePerPerson + returnPerPerson) * passengerCount
  const taxes = Math.round(baseFare * 0.14)
  const totalPrice = baseFare + addOnsCost + taxes

  const stepIndex = STEPS.findIndex(s => s.key === step)

  function handlePassengersComplete(pax: Passenger[], email: string) {
    setPassengers(pax)
    setContactEmail(email)
    setStep('seats')
    window.scrollTo(0, 0)
  }

  function handleSeatsComplete(seats: string[]) {
    setSelectedSeats(seats)
    setStep('addons')
    window.scrollTo(0, 0)
  }

  function handleAddOnsComplete(addons: AddOn[]) {
    setSelectedAddOns(addons)
    setStep('payment')
    window.scrollTo(0, 0)
  }

  function handlePaymentComplete() {
    const bookingId = crypto.randomUUID()
    addBooking({
      id: bookingId,
      pnr: generatePNR(),
      outboundFlight: flight,
      returnFlight: returnFlight ?? undefined,
      passengers,
      selectedSeats,
      addOns: selectedAddOns,
      cabinClass,
      passengersCount: passengerCount,
      baseFare,
      addOnsCost,
      taxes,
      totalPrice,
      contactEmail,
      createdAt: new Date().toISOString(),
    })
    router.push(`/confirmation/${bookingId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Flight summary strip */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: flight.airline.color }}
            >
              {flight.airline.code}
            </span>
            <span className="font-medium text-gray-900">
              {flight.origin.code} → {flight.destination.code}
            </span>
            <span className="text-gray-400">·</span>
            <span>{formatDate(flight.departureTime)}</span>
            <span className="text-gray-400">·</span>
            <span>{formatTime(flight.departureTime)} – {formatTime(flight.arrivalTime)}</span>
            <span className="text-gray-400">·</span>
            <span className="capitalize">{cabinClass}</span>
            <span className="text-gray-400">·</span>
            <span>{passengerCount} pax</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      i < stepIndex ? 'bg-green-500 text-white' :
                      i === stepIndex ? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {i < stepIndex ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === stepIndex ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            {step === 'passengers' && (
              <PassengerStep count={passengerCount} onComplete={handlePassengersComplete} />
            )}
            {step === 'seats' && (
              <SeatStep
                flight={flight}
                cabinClass={cabinClass}
                count={passengerCount}
                onComplete={handleSeatsComplete}
                onBack={() => setStep('passengers')}
              />
            )}
            {step === 'addons' && (
              <AddOnsStep
                passengerCount={passengerCount}
                selected={selectedAddOns}
                onComplete={handleAddOnsComplete}
                onBack={() => setStep('seats')}
              />
            )}
            {step === 'payment' && (
              <PaymentStep
                totalPrice={totalPrice}
                contactEmail={contactEmail}
                onComplete={handlePaymentComplete}
                onBack={() => setStep('addons')}
              />
            )}
          </div>

          {/* Price summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Base fare ({passengerCount} pax)</span>
                  <span>${baseFare}</span>
                </div>
                {returnFlight && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span className="pl-3">Outbound</span>
                    <span>${basePerPerson * passengerCount}</span>
                  </div>
                )}
                {returnFlight && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span className="pl-3">Return</span>
                    <span>${returnPerPerson * passengerCount}</span>
                  </div>
                )}
                {addOnsCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Add-ons</span>
                    <span>${addOnsCost}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & fees</span>
                  <span>${taxes}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-600">${totalPrice}</span>
                </div>
              </div>

              {/* Flight mini-card */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Outbound</p>
                <FlightMini flight={flight} />
                {returnFlight && (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-2">Return</p>
                    <FlightMini flight={returnFlight} />
                  </>
                )}
              </div>

              {selectedSeats.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Selected seats</p>
                  <p className="text-sm font-medium text-gray-700">{selectedSeats.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlightMini({ flight }: { flight: Flight }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <div
        className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs shrink-0"
        style={{ backgroundColor: flight.airline.color }}
      >
        {flight.airline.code}
      </div>
      <span className="font-medium">{flight.origin.code} → {flight.destination.code}</span>
      <span className="text-gray-400">{formatTime(flight.departureTime)}</span>
      <span className="text-gray-300">·</span>
      <span className="text-gray-400">{formatDuration(flight.durationMinutes)}</span>
    </div>
  )
}

// ——— Passenger Step ———

function PassengerStep({
  count, onComplete,
}: {
  count: number
  onComplete: (passengers: Passenger[], email: string) => void
}) {
  const empty = (): Passenger => ({ firstName: '', lastName: '', dob: '', gender: '', documentNumber: '' })
  const [pax, setPax] = useState<Passenger[]>(Array.from({ length: count }, empty))
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  function update(i: number, field: keyof Passenger, value: string) {
    setPax(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function validate(): boolean {
    const errs: string[] = []
    pax.forEach((p, i) => {
      if (!p.firstName.trim()) errs.push(`Passenger ${i + 1}: First name required`)
      if (!p.lastName.trim()) errs.push(`Passenger ${i + 1}: Last name required`)
      if (!p.dob) errs.push(`Passenger ${i + 1}: Date of birth required`)
      if (!p.gender) errs.push(`Passenger ${i + 1}: Gender required`)
    })
    if (!email.trim() || !email.includes('@')) errs.push('Valid contact email required')
    setErrors(errs)
    return errs.length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onComplete(pax, email)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Traveler Information</h2>

        {pax.map((p, i) => (
          <div key={i} className={`${i > 0 ? 'mt-6 pt-6 border-t border-gray-100' : ''}`}>
            <p className="text-sm font-semibold text-blue-600 mb-3">
              {count > 1 ? `Passenger ${i + 1}` : 'Passenger Details'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                <input
                  type="text"
                  value={p.firstName}
                  onChange={e => update(i, 'firstName', e.target.value)}
                  placeholder="John"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={p.lastName}
                  onChange={e => update(i, 'lastName', e.target.value)}
                  placeholder="Smith"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={p.dob}
                  onChange={e => update(i, 'dob', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
                <select
                  value={p.gender}
                  onChange={e => update(i, 'gender', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Non-binary / Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Passport / ID Number</label>
                <input
                  type="text"
                  value={p.documentNumber}
                  onChange={e => update(i, 'documentNumber', e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-3">Contact Information</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Your booking confirmation will be sent here.</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        Continue to Seat Selection →
      </button>
    </form>
  )
}

// ——— Seat Step ———

function SeatStep({
  flight, cabinClass, count, onComplete, onBack,
}: {
  flight: Flight
  cabinClass: 'economy' | 'business' | 'first'
  count: number
  onComplete: (seats: string[]) => void
  onBack: () => void
}) {
  const seatMap: SeatRow[] = generateSeatMap(flight.id, cabinClass)
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState('')

  function toggleSeat(code: string, taken: boolean) {
    if (taken) return
    setSelected(prev => {
      if (prev.includes(code)) return prev.filter(s => s !== code)
      if (prev.length >= count) return [...prev.slice(1), code]
      return [...prev, code]
    })
    setError('')
  }

  function handleSubmit() {
    if (selected.length < count) {
      setError(`Please select ${count} seat${count > 1 ? 's' : ''}.`)
      return
    }
    onComplete(selected)
  }

  const colLabels = cabinClass === 'first' ? ['A', 'C', '', 'D', 'F'] : ['A', 'B', 'C', '', 'D', 'E', 'F']

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Your Seat{count > 1 ? 's' : ''}</h2>
        <p className="text-xs text-gray-500 mb-4">Choose {count} seat{count > 1 ? 's' : ''} · <span className="capitalize">{cabinClass}</span> cabin</p>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded border border-gray-300 bg-white" />Available</div>
          <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-gray-200" />Taken</div>
          <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded bg-blue-600" />Selected</div>
        </div>

        {/* Seat map */}
        <div className="overflow-x-auto">
          <div className="min-w-max mx-auto" style={{ maxWidth: 320 }}>
            {/* Column headers */}
            <div className="flex items-center justify-center gap-1 mb-2 ml-8">
              {colLabels.map((c, i) => (
                <div key={i} className={`w-7 text-center text-xs font-medium text-gray-400 ${c === '' ? 'w-3' : ''}`}>
                  {c}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {seatMap.map(({ row, seats }) => (
                <div key={row} className="flex items-center gap-1">
                  <div className="w-7 text-right text-xs text-gray-400 pr-1 shrink-0">{row}</div>
                  {cabinClass === 'first'
                    ? seats.map(s => (
                        <SeatCell key={s.code} seat={s} selected={selected.includes(s.code)} onClick={() => toggleSeat(s.code, s.taken)} />
                      )).reduce<React.ReactNode[]>((acc, el, i) => {
                        if (i === 2) acc.push(<div key="aisle" className="w-3" />)
                        acc.push(el)
                        return acc
                      }, [])
                    : seats.map(s => (
                        <SeatCell key={s.code} seat={s} selected={selected.includes(s.code)} onClick={() => toggleSeat(s.code, s.taken)} />
                      )).reduce<React.ReactNode[]>((acc, el, i) => {
                        if (i === 3) acc.push(<div key="aisle" className="w-3" />)
                        acc.push(el)
                        return acc
                      }, [])
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {selected.length > 0 && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            Selected: <span className="font-semibold text-blue-600">{selected.join(', ')}</span>
          </p>
        )}
        {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          Continue to Add-ons →
        </button>
      </div>
    </div>
  )
}

function SeatCell({ seat, selected, onClick }: { seat: { code: string; taken: boolean }; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={seat.taken}
      title={seat.code}
      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
        seat.taken ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
        selected ? 'bg-blue-600 text-white' :
        'bg-white border border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      {selected ? '✓' : ''}
    </button>
  )
}

// ——— Add-ons Step ———

function AddOnsStep({
  passengerCount, selected, onComplete, onBack,
}: {
  passengerCount: number
  selected: AddOn[]
  onComplete: (addons: AddOn[]) => void
  onBack: () => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set(selected.map(a => a.id)))

  function toggle(addon: AddOn) {
    setPicked(prev => {
      const next = new Set(prev)
      if (next.has(addon.id)) next.delete(addon.id)
      else next.add(addon.id)
      return next
    })
  }

  const pickedAddOns = ADD_ONS.filter(a => picked.has(a.id))
  const total = pickedAddOns.reduce((sum, a) => sum + (a.perPassenger ? a.price * passengerCount : a.price), 0)

  const iconMap: Record<string, React.ReactNode> = {
    checkedBag: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    extraBag: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    priority: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    meal: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
    insurance: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    lounge: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Enhance Your Trip</h2>
        <p className="text-xs text-gray-500 mb-5">Optional add-ons to make your journey more comfortable</p>

        <div className="space-y-3">
          {ADD_ONS.map(addon => {
            const isSelected = picked.has(addon.id)
            const price = addon.perPassenger ? addon.price * passengerCount : addon.price
            return (
              <div
                key={addon.id}
                onClick={() => toggle(addon)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {iconMap[addon.type] ?? iconMap.meal}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{addon.name}</p>
                  <p className="text-xs text-gray-500">{addon.description}</p>
                  {addon.perPassenger && passengerCount > 1 && (
                    <p className="text-xs text-gray-400">${addon.price} × {passengerCount} passengers</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">${price}</p>
                  <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ml-auto transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {total > 0 && (
          <p className="mt-4 text-sm text-right font-semibold text-gray-700">
            Add-ons total: <span className="text-blue-600">${total}</span>
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={() => onComplete(pickedAddOns)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          Continue to Payment →
        </button>
      </div>
    </div>
  )
}

// ——— Payment Step ———

function PaymentStep({
  totalPrice, contactEmail, onComplete, onBack,
}: {
  totalPrice: number
  contactEmail: string
  onComplete: () => void
  onBack: () => void
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function formatCard(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  function validate(): boolean {
    const errs: string[] = []
    if (cardNumber.replace(/\s/g, '').length < 16) errs.push('Enter a valid 16-digit card number.')
    if (expiry.length < 5) errs.push('Enter a valid expiry date (MM/YY).')
    if (cvv.length < 3) errs.push('Enter a valid CVV.')
    if (!name.trim()) errs.push('Name on card is required.')
    setErrors(errs)
    return errs.length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      onComplete()
    }, 1800)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Details</h2>
        <p className="text-xs text-gray-500 mb-5">This is a demo — no real charge will be made.</p>

        {/* Card type icons */}
        <div className="flex items-center gap-2 mb-5">
          {['VISA', 'MC', 'AMEX', 'DISC'].map(c => (
            <div key={c} className="px-2 py-1 rounded border border-gray-200 text-xs font-bold text-gray-500">{c}</div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Card Number *</label>
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date *</label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CVV *</label>
              <input
                type="text"
                inputMode="numeric"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name on Card *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
          </div>
        )}

        <div className="mt-5 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-gray-500">Your payment information is encrypted and secure.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={loading} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>Pay ${totalPrice} & Book</>
          )}
        </button>
      </div>
    </form>
  )
}
