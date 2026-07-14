import { rsi } from '../trading-bot/indicators'

export interface TickerSnapshot {
  ticker: string
  price: number
  change1d: number
  change5d: number
  rsi14: number
  trend: 'up' | 'down' | 'flat'
  news: string[]
}

async function yahooChart(ticker: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } },
  )
  if (!res.ok) throw new Error(`Yahoo ${ticker} → ${res.status}`)
  return res.json()
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
  const [chartData, news] = await Promise.all([yahooChart(ticker), fetchNews(ticker)])

  const result = chartData?.chart?.result?.[0]
  if (!result) throw new Error(`No chart data for ${ticker}`)

  const price: number = result.meta.regularMarketPrice
  const prevClose: number = result.meta.previousClose ?? result.meta.chartPreviousClose ?? price
  const change1d = ((price - prevClose) / prevClose) * 100

  const closes: number[] = (result.indicators.quote[0].close as (number | null)[])
    .filter((c): c is number => c !== null)

  const price5dAgo = closes.at(-6) ?? closes[0]
  const change5d = ((price - price5dAgo) / price5dAgo) * 100
  const rsi14 = rsi(closes)
  const trend: TickerSnapshot['trend'] = change5d > 1 ? 'up' : change5d < -1 ? 'down' : 'flat'

  return { ticker, price, change1d, change5d, rsi14, trend, news }
}
