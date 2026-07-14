import { randomUUID } from 'crypto'
import { TICKERS } from './config'
import { detectSignals } from './signals'
import { chooseStrategy } from './strategies'
import { upsertTrade, pendingTrades } from './store'
import { sendTradeAlert, sendErrorAlert } from './notifier'
import type { Trade } from './types'

async function fetchYahoo(ticker: string): Promise<{ price: number; closes: number[] }> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } },
  )
  if (!res.ok) throw new Error(`Yahoo ${ticker} → ${res.status}`)
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) throw new Error(`No chart data for ${ticker}`)
  const price: number = result.meta.regularMarketPrice
  const closes: number[] = (result.indicators.quote[0].close as (number | null)[])
    .filter((c): c is number => c !== null)
  return { price, closes }
}

export interface ScanResult {
  ticker: string
  status: 'trade_found' | 'no_signal' | 'skipped' | 'error'
  tradeId?: string
  error?: string
}

export async function scanTicker(ticker: string): Promise<ScanResult> {
  if (pendingTrades().some(t => t.ticker === ticker)) return { ticker, status: 'skipped' }

  try {
    const { price, closes } = await fetchYahoo(ticker)
    const signals = detectSignals(ticker, closes, price)
    if (!signals.length) return { ticker, status: 'no_signal' }

    const strategy = chooseStrategy(signals)
    const now = new Date().toISOString()
    const trade: Trade = { id: randomUUID(), ticker, price, strategy, signals, status: 'PENDING', createdAt: now, updatedAt: now }

    upsertTrade(trade)
    await sendTradeAlert(trade)
    return { ticker, status: 'trade_found', tradeId: trade.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sendErrorAlert(ticker, msg).catch(() => {})
    return { ticker, status: 'error', error: msg }
  }
}

export async function runScan(): Promise<ScanResult[]> {
  const results: ScanResult[] = []
  for (const ticker of TICKERS) {
    results.push(await scanTicker(ticker))
  }
  return results
}
