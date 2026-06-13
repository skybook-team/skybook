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
  logoUrl: string
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
  aircraft: string
  carryOnIncluded: boolean
  checkedBagPrice: number | null  // null = free
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
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'GB' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'FR' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'JP' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'AE' },
  { code: 'CUN', city: 'Cancun', name: 'Cancun International Airport', country: 'MX' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International', country: 'CA' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'AU' },
  { code: 'MEX', city: 'Mexico City', name: 'Benito Juárez International', country: 'MX' },
]

export const AIRLINES: Airline[] = [
  { code: 'AA', name: 'American Airlines', color: '#C8102E', logoUrl: 'https://logo.clearbit.com/aa.com' },
  { code: 'DL', name: 'Delta Air Lines',   color: '#003DA5', logoUrl: 'https://logo.clearbit.com/delta.com' },
  { code: 'UA', name: 'United Airlines',   color: '#005DAA', logoUrl: 'https://logo.clearbit.com/united.com' },
  { code: 'WN', name: 'Southwest Airlines',color: '#304CB2', logoUrl: 'https://logo.clearbit.com/southwest.com' },
  { code: 'B6', name: 'JetBlue Airways',   color: '#0033A0', logoUrl: 'https://logo.clearbit.com/jetblue.com' },
  { code: 'AS', name: 'Alaska Airlines',   color: '#0074C8', logoUrl: 'https://logo.clearbit.com/alaskaair.com' },
  { code: 'NK', name: 'Spirit Airlines',   color: '#7c6f00', logoUrl: 'https://logo.clearbit.com/spirit.com' },
  { code: 'F9', name: 'Frontier Airlines', color: '#007A3E', logoUrl: 'https://logo.clearbit.com/flyfrontier.com' },
]

// Real aircraft types by airline
const AIRCRAFT: Record<string, string[]> = {
  AA: ['Boeing 737-800', 'Airbus A321', 'Boeing 777-200ER', 'Airbus A319', 'Boeing 787-9 Dreamliner', 'Airbus A321XLR'],
  DL: ['Airbus A220-300', 'Boeing 737-900ER', 'Airbus A321neo', 'Boeing 767-300ER', 'Airbus A330-900neo', 'Boeing 757-200'],
  UA: ['Boeing 737-800', 'Boeing 737 MAX 9', 'Airbus A320neo', 'Boeing 777-300ER', 'Boeing 787-9 Dreamliner', 'Boeing 757-200'],
  WN: ['Boeing 737-800', 'Boeing 737 MAX 8', 'Boeing 737-700', 'Boeing 737 MAX 7'],
  B6: ['Airbus A320', 'Airbus A321', 'Airbus A220-300', 'Embraer E190', 'Airbus A321neo'],
  AS: ['Boeing 737-900ER', 'Boeing 737-800', 'Airbus A320', 'Embraer E175', 'Boeing 737 MAX 9'],
  NK: ['Airbus A320', 'Airbus A321neo', 'Airbus A319'],
  F9: ['Airbus A320neo', 'Airbus A321neo', 'Airbus A319neo'],
}

// Real baggage policies
const BAGGAGE: Record<string, { carryOnIncluded: boolean; checkedBagPrice: number | null }> = {
  AA: { carryOnIncluded: true,  checkedBagPrice: 30 },
  DL: { carryOnIncluded: true,  checkedBagPrice: 30 },
  UA: { carryOnIncluded: true,  checkedBagPrice: 35 },
  WN: { carryOnIncluded: true,  checkedBagPrice: null },  // 2 bags always free
  B6: { carryOnIncluded: true,  checkedBagPrice: 35 },
  AS: { carryOnIncluded: true,  checkedBagPrice: 30 },
  NK: { carryOnIncluded: false, checkedBagPrice: 45 },    // carry-on costs extra
  F9: { carryOnIncluded: false, checkedBagPrice: 49 },    // carry-on costs extra
}

// Budget airline multipliers (Spirit/Frontier are cheaper base but add fees)
const AIRLINE_PRICE_FACTOR: Record<string, number> = {
  AA: 1.0, DL: 1.05, UA: 0.98, WN: 0.88, B6: 0.85, AS: 0.90, NK: 0.60, F9: 0.62,
}

const ROUTE_DURATIONS: Record<string, number> = {
  'JFK-LAX': 335, 'LAX-JFK': 315, 'JFK-ORD': 145, 'ORD-JFK': 150,
  'JFK-MIA': 175, 'MIA-JFK': 185, 'JFK-SFO': 345, 'SFO-JFK': 320,
  'JFK-ATL': 155, 'ATL-JFK': 160, 'JFK-BOS': 65,  'BOS-JFK': 65,
  'JFK-DFW': 215, 'DFW-JFK': 220, 'JFK-LAS': 325, 'LAS-JFK': 305,
  'JFK-DEN': 265, 'DEN-JFK': 255, 'JFK-SEA': 350, 'SEA-JFK': 330,
  'JFK-IAH': 225, 'IAH-JFK': 230, 'JFK-MCO': 185, 'MCO-JFK': 190,
  'LAX-ORD': 240, 'ORD-LAX': 255, 'LAX-SFO': 75,  'SFO-LAX': 80,
  'LAX-SEA': 155, 'SEA-LAX': 160, 'LAX-LAS': 65,  'LAS-LAX': 65,
  'LAX-DEN': 165, 'DEN-LAX': 170, 'LAX-ATL': 265, 'ATL-LAX': 275,
  'LAX-MIA': 310, 'MIA-LAX': 325, 'LAX-PHX': 75,  'PHX-LAX': 80,
  'ATL-ORD': 130, 'ORD-ATL': 125, 'ATL-MIA': 120, 'MIA-ATL': 125,
  'ORD-DFW': 165, 'DFW-ORD': 170, 'ORD-DEN': 160, 'DEN-ORD': 155,
  'JFK-LHR': 430, 'LHR-JFK': 465, 'JFK-CDG': 460, 'CDG-JFK': 500,
  'LAX-LHR': 625, 'LHR-LAX': 665, 'LAX-NRT': 660, 'NRT-LAX': 590,
  'LAX-DXB': 920, 'DXB-LAX': 960, 'JFK-DXB': 790, 'DXB-JFK': 820,
  'JFK-NRT': 825, 'NRT-JFK': 760, 'MIA-CUN': 110, 'CUN-MIA': 120,
  'JFK-CUN': 210, 'CUN-JFK': 220, 'LAX-CUN': 285, 'CUN-LAX': 295,
  'JFK-YYZ': 100, 'YYZ-JFK': 105, 'ORD-YYZ': 85,  'YYZ-ORD': 85,
  'LAX-SYD': 955, 'SYD-LAX': 870,
}

const STOP_CITIES: Record<string, string[]> = {
  'JFK-LAX': ['ORD', 'DFW', 'ATL'], 'LAX-JFK': ['ORD', 'DFW', 'ATL'],
  'JFK-SFO': ['ORD', 'DEN', 'DFW'], 'SFO-JFK': ['ORD', 'DEN', 'ATL'],
  'JFK-SEA': ['ORD', 'DEN'],        'SEA-JFK': ['ORD', 'DEN'],
  'LAX-BOS': ['ORD', 'ATL'],        'BOS-LAX': ['ORD', 'ATL'],
  'LAX-MIA': ['DFW', 'ATL'],        'MIA-LAX': ['DFW', 'ATL'],
  'LAX-LHR': ['JFK', 'BOS'],        'LHR-LAX': ['JFK', 'BOS'],
  'JFK-NRT': ['LAX', 'SEA'],        'NRT-JFK': ['LAX', 'SEA'],
  'JFK-DXB': ['LHR', 'CDG'],        'DXB-JFK': ['LHR', 'CDG'],
}

// Realistic base prices by distance tier (minutes)
function getBasePrice(durationMinutes: number, airlineCode: string): number {
  let base: number
  if (durationMinutes < 90)       base = 69   // ultra-short
  else if (durationMinutes < 150) base = 99   // short
  else if (durationMinutes < 240) base = 149  // medium-short
  else if (durationMinutes < 360) base = 219  // medium
  else if (durationMinutes < 480) base = 299  // long domestic
  else if (durationMinutes < 600) base = 449  // short international
  else if (durationMinutes < 720) base = 599  // medium international
  else                            base = 799  // long haul

  return Math.round(base * (AIRLINE_PRICE_FACTOR[airlineCode] ?? 1.0))
}

function seededRand(seed: string): () => number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) & 0x7fffffff
  return () => { h = ((h * 1664525) + 1013904223) & 0x7fffffff; return h / 0x7fffffff }
}

function getBaseDuration(from: string, to: string): number {
  const key = `${from}-${to}`
  if (ROUTE_DURATIONS[key]) return ROUTE_DURATIONS[key]
  const intl = ['LHR', 'CDG', 'NRT', 'DXB', 'SYD', 'CUN', 'YYZ', 'MEX']
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
  const stopOptions = STOP_CITIES[`${from}-${to}`] || ['ORD', 'ATL', 'DFW', 'DEN']

  return Array.from({ length: count }, (_, i) => {
    const r = seededRand(`${from}-${to}-${date}-${i}`)
    const airline = AIRLINES[Math.floor(r() * AIRLINES.length)]
    const aircraftList = AIRCRAFT[airline.code] || ['Boeing 737-800']
    const aircraft = aircraftList[Math.floor(r() * aircraftList.length)]
    const baggage = BAGGAGE[airline.code] || { carryOnIncluded: true, checkedBagPrice: 35 }

    // Realistic flight number ranges per airline
    const flightNumRanges: Record<string, [number, number]> = {
      AA: [1, 3999], DL: [1, 4999], UA: [1, 5999], WN: [1, 9999],
      B6: [1, 2999], AS: [1, 999], NK: [1, 999], F9: [1, 999],
    }
    const [min, max] = flightNumRanges[airline.code] || [100, 9999]
    const flightNum = `${airline.code} ${min + Math.floor(r() * (max - min))}`

    // Departure: realistic times (avoid 1am-4am)
    const timeSlots = [5,6,6,7,7,8,8,9,10,11,12,13,14,15,16,17,17,18,19,20,21,22]
    const depHour = timeSlots[Math.floor(r() * timeSlots.length)]
    const depMin = Math.floor(r() * 4) * 15

    const dep = new Date(`${date}T00:00:00`)
    dep.setHours(depHour, depMin, 0, 0)

    const durationVariance = 0.90 + r() * 0.22
    const duration = Math.round(baseDuration * durationVariance)
    const arr = new Date(dep.getTime() + duration * 60000)

    // Nonstop more common for short routes
    const nonStopChance = baseDuration < 200 ? 0.75 : 0.45
    const stopsRoll = r()
    const stops = stopsRoll < nonStopChance ? 0 : stopsRoll < 0.85 ? 1 : 2
    const stopIdx = Math.floor(r() * stopOptions.length)

    // Realistic price with variance
    const base = getBasePrice(duration, airline.code)
    const priceVariance = 0.80 + r() * 0.55  // ±27% variance
    const economyPrice = Math.round(base * priceVariance / 5) * 5  // round to nearest $5
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
      aircraft,
      carryOnIncluded: baggage.carryOnIncluded,
      checkedBagPrice: baggage.checkedBagPrice,
      economy: { price: economyPrice, seatsLeft },
      business: { price: Math.round(economyPrice * 2.8 / 5) * 5, seatsLeft: Math.max(1, Math.floor(seatsLeft * 0.3)) },
      first: { price: Math.round(economyPrice * 5.5 / 5) * 5, seatsLeft: Math.max(1, Math.floor(seatsLeft * 0.12)) },
    } as Flight
  }).sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getPriceForClass(flight: Flight, cls: 'economy' | 'business' | 'first'): number {
  return flight[cls].price
}

export const ADD_ONS: AddOn[] = [
  { id: 'checked-bag',  type: 'checkedBag',  name: 'Checked Bag (23kg)',       description: 'First checked bag allowance',                  price: 35, perPassenger: false },
  { id: 'extra-bag',   type: 'extraBag',    name: 'Extra Checked Bag (23kg)', description: 'Second checked bag',                           price: 50, perPassenger: false },
  { id: 'priority',    type: 'priority',    name: 'Priority Boarding',        description: 'Board among the first group of passengers',    price: 15, perPassenger: true  },
  { id: 'meal-std',    type: 'meal',        name: 'Standard Meal',            description: 'Choice of chicken or pasta',                   price: 12, perPassenger: true  },
  { id: 'meal-veg',    type: 'meal',        name: 'Vegetarian Meal',          description: 'Plant-based meal option',                      price: 12, perPassenger: true  },
  { id: 'insurance',   type: 'insurance',   name: 'Travel Insurance',         description: 'Trip cancellation, medical & baggage coverage', price: 29, perPassenger: true  },
  { id: 'lounge',      type: 'lounge',      name: 'Airport Lounge Access',    description: 'Access to premium lounge before departure',    price: 45, perPassenger: false },
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
    cabinClass === 'first'    ? { rows: 4,  start: 1,  cols: ['A', 'C', 'D', 'F'] } :
    cabinClass === 'business' ? { rows: 8,  start: 5,  cols: ['A', 'B', 'D', 'E'] } :
                                { rows: 26, start: 13, cols: ['A', 'B', 'C', 'D', 'E', 'F'] }

  return Array.from({ length: config.rows }, (_, rowIdx) => ({
    row: config.start + rowIdx,
    seats: config.cols.map(col => ({
      code: `${config.start + rowIdx}${col}`,
      taken: rand() < 0.42,
      type: (col === 'A' || col === 'F') ? 'window' : (col === 'C' || col === 'D') ? 'aisle' : 'middle',
      class: cabinClass,
    } as SeatInfo)),
  }))
}

export function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
