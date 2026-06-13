export interface Airport {
  code: string
  city: string
  name: string
  country: string
}

export interface Airline {
  code: string
  name: string
  color: string
}

export interface FlightClass {
  price: number
  seatsLeft: number
}

export interface Flight {
  id: string
  flightNumber: string
  airline: Airline
  origin: Airport
  destination: Airport
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  stops: number
  stopCity?: string
  economy: FlightClass
  business: FlightClass
  first: FlightClass
}

export interface Passenger {
  firstName: string
  lastName: string
  dob: string
  gender: string
  documentNumber: string
}

export interface AddOn {
  id: string
  type: 'checkedBag' | 'extraBag' | 'meal' | 'insurance' | 'priority' | 'lounge'
  name: string
  description: string
  price: number
  perPassenger: boolean
}

export interface SearchParams {
  from: string
  to: string
  date: string
  returnDate?: string
  passengers: number
  cabinClass: 'economy' | 'business' | 'first'
  tripType: 'oneWay' | 'roundTrip'
}

export interface PendingBooking {
  id: string
  outboundFlight: Flight
  returnFlight?: Flight
  searchParams: SearchParams
}

export interface CompletedBooking {
  id: string
  pnr: string
  outboundFlight: Flight
  returnFlight?: Flight
  passengers: Passenger[]
  selectedSeats: string[]
  addOns: AddOn[]
  cabinClass: 'economy' | 'business' | 'first'
  passengersCount: number
  baseFare: number
  addOnsCost: number
  taxes: number
  totalPrice: number
  contactEmail: string
  createdAt: string
}

export const AIRPORTS: Airport[] = [
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'US' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'US' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'US' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International', country: 'US' },
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta', country: 'US' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'US' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', country: 'US' },
  { code: 'MIA', city: 'Miami', name: 'Miami International', country: 'US' },
  { code: 'BOS', city: 'Boston', name: 'Logan International', country: 'US' },
  { code: 'DEN', city: 'Denver', name: 'Denver International', country: 'US' },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International', country: 'US' },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International', country: 'US' },
  { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental', country: 'US' },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International', country: 'US' },
  { code: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International', country: 'US' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'FR' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'JP' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'CUN', city: 'Cancun', name: 'Cancun International Airport', country: 'MX' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International', country: 'CA' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'AU' },
]

export const AIRLINES: Airline[] = [
  { code: 'DL', name: 'Delta Air Lines', color: '#003DA5' },
  { code: 'UA', name: 'United Airlines', color: '#005DAA' },
  { code: 'AA', name: 'American Airlines', color: '#C8102E' },
  { code: 'WN', name: 'Southwest Airlines', color: '#304CB2' },
  { code: 'B6', name: 'JetBlue Airways', color: '#0033A0' },
  { code: 'NK', name: 'Spirit Airlines', color: '#7c6f00' },
  { code: 'F9', name: 'Frontier Airlines', color: '#007A3E' },
  { code: 'AS', name: 'Alaska Airlines', color: '#0074C8' },
]

const ROUTE_DURATIONS: Record<string, number> = {
  'JFK-LAX': 335, 'LAX-JFK': 315, 'JFK-ORD': 145, 'ORD-JFK': 150,
  'JFK-MIA': 175, 'MIA-JFK': 185, 'JFK-SFO': 345, 'SFO-JFK': 320,
  'JFK-ATL': 155, 'ATL-JFK': 160, 'JFK-BOS': 65, 'BOS-JFK': 65,
  'JFK-DFW': 215, 'DFW-JFK': 220, 'JFK-LAS': 325, 'LAS-JFK': 305,
  'JFK-DEN': 265, 'DEN-JFK': 255, 'JFK-SEA': 350, 'SEA-JFK': 330,
  'JFK-IAH': 225, 'IAH-JFK': 230, 'JFK-MCO': 185, 'MCO-JFK': 190,
  'LAX-ORD': 240, 'ORD-LAX': 255, 'LAX-SFO': 75, 'SFO-LAX': 80,
  'LAX-SEA': 155, 'SEA-LAX': 160, 'LAX-LAS': 65, 'LAS-LAX': 65,
  'LAX-DEN': 165, 'DEN-LAX': 170, 'LAX-ATL': 265, 'ATL-LAX': 275,
  'LAX-MIA': 310, 'MIA-LAX': 325, 'LAX-PHX': 75, 'PHX-LAX': 80,
  'ATL-ORD': 130, 'ORD-ATL': 125, 'ATL-MIA': 120, 'MIA-ATL': 125,
  'ORD-DFW': 165, 'DFW-ORD': 170, 'ORD-DEN': 160, 'DEN-ORD': 155,
  'JFK-LHR': 430, 'LHR-JFK': 465, 'JFK-CDG': 460, 'CDG-JFK': 500,
  'LAX-LHR': 625, 'LHR-LAX': 665, 'LAX-NRT': 660, 'NRT-LAX': 590,
  'LAX-DXB': 920, 'DXB-LAX': 960, 'JFK-DXB': 790, 'DXB-JFK': 820,
  'JFK-NRT': 825, 'NRT-JFK': 760, 'MIA-CUN': 110, 'CUN-MIA': 120,
  'JFK-CUN': 210, 'CUN-JFK': 220, 'LAX-CUN': 285, 'CUN-LAX': 295,
  'JFK-YYZ': 100, 'YYZ-JFK': 105, 'ORD-YYZ': 85, 'YYZ-ORD': 85,
  'LAX-SYD': 955, 'SYD-LAX': 870,
}

const STOP_CITIES: Record<string, string[]> = {
  'JFK-LAX': ['ORD', 'DFW', 'ATL'], 'LAX-JFK': ['ORD', 'DFW', 'ATL'],
  'JFK-SFO': ['ORD', 'DEN', 'DFW'], 'SFO-JFK': ['ORD', 'DEN', 'ATL'],
  'JFK-SEA': ['ORD', 'DEN'], 'SEA-JFK': ['ORD', 'DEN'],
  'LAX-BOS': ['ORD', 'ATL'], 'BOS-LAX': ['ORD', 'ATL'],
  'LAX-MIA': ['DFW', 'ATL'], 'MIA-LAX': ['DFW', 'ATL'],
  'LAX-LHR': ['JFK', 'BOS'], 'LHR-LAX': ['JFK', 'BOS'],
  'JFK-NRT': ['LAX', 'SEA'], 'NRT-JFK': ['LAX', 'SEA'],
  'JFK-DXB': ['LHR', 'CDG'], 'DXB-JFK': ['LHR', 'CDG'],
}

function seededRand(seed: string): () => number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) & 0x7fffffff
  }
  return function () {
    h = ((h * 1664525) + 1013904223) & 0x7fffffff
    return h / 0x7fffffff
  }
}

function getBaseDuration(from: string, to: string): number {
  const key = `${from}-${to}`
  if (ROUTE_DURATIONS[key]) return ROUTE_DURATIONS[key]
  const intl = ['LHR', 'CDG', 'NRT', 'DXB', 'SYD', 'CUN', 'YYZ']
  if (intl.includes(from) || intl.includes(to)) return 600
  return 240
}

export function generateFlights(from: string, to: string, date: string): Flight[] {
  const fromAirport = AIRPORTS.find(a => a.code === from)
  const toAirport = AIRPORTS.find(a => a.code === to)
  if (!fromAirport || !toAirport || from === to) return []

  const baseDuration = getBaseDuration(from, to)
  const countRand = seededRand(`${from}-${to}-${date}-count`)
  const count = 7 + Math.floor(countRand() * 4)

  const stopOptions = STOP_CITIES[`${from}-${to}`] || ['ORD', 'ATL', 'DFW', 'DEN', 'ORD']

  return Array.from({ length: count }, (_, i) => {
    const r = seededRand(`${from}-${to}-${date}-${i}`)
    const airline = AIRLINES[Math.floor(r() * AIRLINES.length)]
    const flightNum = `${airline.code}${100 + Math.floor(r() * 900)}`
    const depHour = 5 + Math.floor(r() * 17)
    const depMin = Math.floor(r() * 4) * 15
    const dep = new Date(`${date}T00:00:00`)
    dep.setHours(depHour, depMin, 0, 0)
    const durationVariance = 0.88 + r() * 0.28
    const duration = Math.round(baseDuration * durationVariance)
    const arr = new Date(dep.getTime() + duration * 60000)
    const stopsRoll = r()
    const stops = stopsRoll < 0.48 ? 0 : stopsRoll < 0.82 ? 1 : 2
    const stopIdx = Math.floor(r() * stopOptions.length)
    const basePrice = 80 + Math.round(r() * 380)
    const seatsLeft = 1 + Math.floor(r() * 42)

    return {
      id: `${from}-${to}-${date}-${i}`,
      flightNumber: flightNum,
      airline,
      origin: fromAirport,
      destination: toAirport,
      departureTime: dep.toISOString(),
      arrivalTime: arr.toISOString(),
      durationMinutes: duration,
      stops,
      stopCity: stops > 0 ? stopOptions[stopIdx] : undefined,
      economy: { price: basePrice, seatsLeft },
      business: { price: Math.round(basePrice * 2.6 + 180), seatsLeft: Math.max(1, Math.floor(seatsLeft * 0.3)) },
      first: { price: Math.round(basePrice * 5.0 + 400), seatsLeft: Math.max(1, Math.floor(seatsLeft * 0.15)) },
    } as Flight
  }).sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getPriceForClass(flight: Flight, cls: 'economy' | 'business' | 'first'): number {
  return flight[cls].price
}

export const ADD_ONS: AddOn[] = [
  {
    id: 'checked-bag',
    type: 'checkedBag',
    name: 'Checked Bag (23kg)',
    description: 'First checked bag allowance',
    price: 35,
    perPassenger: false,
  },
  {
    id: 'extra-bag',
    type: 'extraBag',
    name: 'Extra Checked Bag (23kg)',
    description: 'Second checked bag',
    price: 50,
    perPassenger: false,
  },
  {
    id: 'priority',
    type: 'priority',
    name: 'Priority Boarding',
    description: 'Board among the first group of passengers',
    price: 15,
    perPassenger: true,
  },
  {
    id: 'meal-standard',
    type: 'meal',
    name: 'Standard Meal',
    description: 'Choice of chicken or pasta',
    price: 12,
    perPassenger: true,
  },
  {
    id: 'meal-veg',
    type: 'meal',
    name: 'Vegetarian Meal',
    description: 'Plant-based meal option',
    price: 12,
    perPassenger: true,
  },
  {
    id: 'insurance',
    type: 'insurance',
    name: 'Travel Insurance',
    description: 'Trip cancellation, medical & baggage coverage',
    price: 29,
    perPassenger: true,
  },
  {
    id: 'lounge',
    type: 'lounge',
    name: 'Airport Lounge Access',
    description: 'Access to premium lounge before departure',
    price: 45,
    perPassenger: false,
  },
]

export interface SeatInfo {
  code: string
  taken: boolean
  type: 'window' | 'middle' | 'aisle'
  class: 'economy' | 'business' | 'first'
}

export interface SeatRow {
  row: number
  seats: SeatInfo[]
}

export function generateSeatMap(flightId: string, cabinClass: 'economy' | 'business' | 'first'): SeatRow[] {
  const rand = seededRand(flightId + '-' + cabinClass)
  const config =
    cabinClass === 'first' ? { rows: 4, start: 1, cols: ['A', 'C', 'D', 'F'] } :
    cabinClass === 'business' ? { rows: 8, start: 5, cols: ['A', 'B', 'D', 'E'] } :
    { rows: 26, start: 13, cols: ['A', 'B', 'C', 'D', 'E', 'F'] }

  return Array.from({ length: config.rows }, (_, rowIdx) => ({
    row: config.start + rowIdx,
    seats: config.cols.map(col => ({
      code: `${config.start + rowIdx}${col}`,
      taken: rand() < 0.42,
      type: (col === 'A' || col === 'F') ? 'window' :
            (col === 'C' || col === 'D') ? 'aisle' : 'middle',
      class: cabinClass,
    } as SeatInfo)),
  }))
}

export function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
