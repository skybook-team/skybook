import { NextRequest, NextResponse } from 'next/server'
import { AIRPORTS, AIRLINES, type Flight } from '@/lib/data'

const AMADEUS_BASE = 'https://test.api.amadeus.com'

// Module-level token cache (survives warm Lambda invocations)
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && now < cachedToken.expiresAt) return cachedToken.value

  const key    = process.env.AMADEUS_API_KEY
  const secret = process.env.AMADEUS_API_SECRET
  if (!key || !secret) throw new Error('AMADEUS_API_KEY / AMADEUS_API_SECRET not set')

  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`)

  cachedToken = { value: data.access_token, expiresAt: now + (data.expires_in - 120) * 1000 }
  return cachedToken.value
}

// IATA aircraft type codes → readable names
const AIRCRAFT: Record<string, string> = {
  '319': 'Airbus A319',        '320': 'Airbus A320',        '321': 'Airbus A321',
  '32A': 'Airbus A320neo',     '32B': 'Airbus A320neo',     '32N': 'Airbus A321neo',
  '32Q': 'Airbus A321neo',     '32S': 'Airbus A321neo',
  '333': 'Airbus A330-300',    '332': 'Airbus A330-200',
  '339': 'Airbus A330-900neo', '338': 'Airbus A330-800neo',
  '77W': 'Boeing 777-300ER',   '772': 'Boeing 777-200ER',
  '788': 'Boeing 787-8',       '789': 'Boeing 787-9',       '78J': 'Boeing 787-9',
  '73H': 'Boeing 737-800',     '738': 'Boeing 737-800',     '73W': 'Boeing 737-700',
  '7M8': 'Boeing 737 MAX 8',   '7M9': 'Boeing 737 MAX 9',   '7M7': 'Boeing 737 MAX 7',
  '757': 'Boeing 757-200',     '75W': 'Boeing 757-200',     '753': 'Boeing 757-300',
  '767': 'Boeing 767-300',     '76W': 'Boeing 767-300ER',
  'E75': 'Embraer E175',       'E7W': 'Embraer E175',       'E70': 'Embraer E170',
  'E90': 'Embraer E190',       'E95': 'Embraer E195',
  'CR9': 'Bombardier CRJ-900', 'CR7': 'Bombardier CRJ-700', 'CR2': 'Bombardier CRJ-200',
  '220': 'Airbus A220-300',    '221': 'Airbus A220-100',    '223': 'Airbus A220-300',
  'DH4': 'Dash 8-400',         'AT7': 'ATR 72',
}

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return 0
  return (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOffer(offer: any, idx: number): Flight | null {
  try {
    const itin  = offer.itineraries[0]
    const segs  = itin.segments
    const first = segs[0]
    const last  = segs[segs.length - 1]

    const code    = first.carrierCode ?? first.operating?.carrierCode ?? 'XX'
    const airline = AIRLINES.find(a => a.code === code) ?? {
      code, name: code, color: '#555',
      logoUrl: `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`,
    }

    const makeAirport = (iata: string, terminal?: string) => {
      const ap = AIRPORTS.find(a => a.code === iata)
      if (ap) return ap
      return { code: iata, city: iata, name: `${iata} Airport`, country: 'US', lat: 0, lon: 0 }
    }

    const origin      = makeAirport(first.departure.iataCode, first.departure.terminal)
    const destination = makeAirport(last.arrival.iataCode,    last.arrival.terminal)

    const stops    = segs.length - 1
    const stopCity = stops > 0 ? segs[0].arrival.iataCode : undefined

    const aircraftCode = first.aircraft?.code ?? ''
    const aircraft     = AIRCRAFT[aircraftCode] ?? (aircraftCode ? `Aircraft ${aircraftCode}` : 'Boeing 737-800')

    const durationMinutes = parseDuration(itin.duration)
    const economyPrice    = Math.round(parseFloat(offer.price.grandTotal))

    // Baggage from Amadeus fare details
    const fareDetails  = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
    const includedBags = fareDetails?.includedCheckedBags?.quantity ?? 0
    const checkedBagPrice: number | null = includedBags > 0 ? null : 30

    // Seats left (Amadeus sometimes provides this)
    const seatsLeft = offer.numberOfBookableSeats ?? (8 + Math.floor(Math.abs(
      (parseInt(offer.id ?? '0') * 17 + idx * 7) % 35
    )))

    return {
      id:             `am-${offer.id}-${idx}`,
      flightNumber:   `${code} ${first.number}`,
      airline,
      origin,
      destination,
      departureTime:  first.departure.at,
      arrivalTime:    last.arrival.at,
      durationMinutes,
      stops,
      stopCity,
      aircraft,
      carryOnIncluded: true,
      checkedBagPrice,
      economy:  { price: economyPrice,                                seatsLeft },
      business: { price: Math.round(economyPrice * 2.8 / 5) * 5,     seatsLeft: Math.max(1, Math.floor(seatsLeft * 0.3)) },
      first:    { price: Math.round(economyPrice * 5.5 / 5) * 5,     seatsLeft: Math.max(1, Math.floor(seatsLeft * 0.12)) },
    } as Flight
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const sp         = new URL(req.url).searchParams
  const from       = sp.get('from')
  const to         = sp.get('to')
  const date       = sp.get('date')
  const passengers = sp.get('passengers') ?? '1'
  const cabinClass = sp.get('cabinClass')  ?? 'economy'

  if (!from || !to || !date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const cabinMap: Record<string, string> = {
    economy: 'ECONOMY', business: 'BUSINESS', first: 'FIRST',
  }

  try {
    const token = await getAccessToken()

    const url = new URL(`${AMADEUS_BASE}/v2/shopping/flight-offers`)
    url.searchParams.set('originLocationCode',      from)
    url.searchParams.set('destinationLocationCode', to)
    url.searchParams.set('departureDate',           date)
    url.searchParams.set('adults',                  passengers)
    url.searchParams.set('travelClass',             cabinMap[cabinClass] ?? 'ECONOMY')
    url.searchParams.set('currencyCode',            'USD')
    url.searchParams.set('max',                     '15')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[flights] Amadeus upstream error', res.status, body)
      return NextResponse.json({ error: 'upstream', flights: [] }, { status: 200 })
    }

    const data = await res.json()

    if (!data.data?.length) {
      return NextResponse.json({ flights: [], source: 'amadeus_empty' })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flights = data.data.map((o: any, i: number) => mapOffer(o, i)).filter(Boolean) as Flight[]
    return NextResponse.json({ flights, source: 'amadeus' })

  } catch (err) {
    console.error('[flights] Error:', err)
    return NextResponse.json({ error: 'server_error', flights: [] }, { status: 200 })
  }
}
