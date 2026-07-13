import { RH_TOKEN, RH_BASE } from '../trading-bot/config'
import { rsi } from '../trading-bot/indicators'

export interface TickerSnapshot {
  ticker: string
  price: number
  change1d: number   // % change today
  change5d: number   // % change over 5 days
  rsi14: number
  trend: 'up' | 'down' | 'flat'
  news: string[]     // recent headlines
}

async function rhGet<T>(path: string): Promise<T> {
  const res = await fetch(`${RH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${RH_TOKEN}`, Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`RH ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

async function fetchNews(ticker: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${ticker}&newsCount=5&enableFuzzyQuery=false`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } },
    )
    if (!res.ok) return []
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.news ?? []).map((n: any) => n.title as string).filter(Boolean).slice(0, 5)
  } catch {
    return []
  }
}

export async function fetchSnapshot(ticker: string): Promise<TickerSnapshot> {
  const [quoteData, histData, news] = await Promise.all([
    rhGet<{ results: Array<{ last_trade_price: string; previous_close: string }> }>(
      `/quotes/?symbols=${ticker}`
    ),
    rhGet<{ results: Array<{ historicals: Array<{ close_price: string }> }> }>(
      `/historicals/?symbols=${ticker}&interval=day&span=month&bounds=regular`
    ),
    fetchNews(ticker),
  ])

  const q = quoteData.results[0]
  const price = parseFloat(q.last_trade_price)
  const prevClose = parseFloat(q.previous_close)
  const change1d = ((price - prevClose) / prevClose) * 100

  const closes = histData.results[0].historicals.map(h => parseFloat(h.close_price))
  const price5dAgo = closes.at(-6) ?? closes[0]
  const change5d = ((price - price5dAgo) / price5dAgo) * 100
  const rsi14 = rsi(closes)

  const trend: TickerSnapshot['trend'] =
    change5d > 1 ? 'up' : change5d < -1 ? 'down' : 'flat'

  return { ticker, price, change1d, change5d, rsi14, trend, news }
}
