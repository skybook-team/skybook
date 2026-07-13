import { NextResponse } from 'next/server'
import { getAll, set } from '@/watcher/store'
import { notifySell } from '@/watcher/notifier'
import { TICKERS } from '@/trading-bot/config'

async function fetchLivePrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null
  } catch {
    return null
  }
}

export async function GET() {
  const entries = getAll()
  const watching = entries.filter(e => e.state === 'watching_sell' && e.buyAlertPrice !== null)

  // Fetch all prices in parallel
  const prices = await Promise.all(
    TICKERS.map(async ticker => ({ ticker, price: await fetchLivePrice(ticker) }))
  )
  const priceMap = Object.fromEntries(prices.map(p => [p.ticker, p.price]))

  const alerts: string[] = []

  for (const entry of watching) {
    const price = priceMap[entry.ticker]
    if (price === null || entry.buyAlertPrice === null) continue

    if (price >= entry.buyAlertPrice + 10) {
      await notifySell(entry.ticker, price, entry.buyAlertPrice)
      set({
        ...entry,
        state: 'waiting_buy',
        buyAlertPrice: null,
        buyAlertTime: null,
        lastChecked: new Date().toISOString(),
        lastReason: `Sold at $${price.toFixed(2)} (+$${(price - entry.buyAlertPrice).toFixed(2)})`,
      })
      alerts.push(entry.ticker)
    }
  }

  return NextResponse.json({ prices: priceMap, sellAlerts: alerts, checkedAt: new Date().toISOString() })
}
