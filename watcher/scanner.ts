import { TICKERS } from '../trading-bot/config'
import { fetchSnapshot } from './fetcher'
import { analyze } from './analyst'
import { get, set } from './store'
import { notifyBuy, notifySell } from './notifier'

const PROFIT_TARGET = 10 // dollars

export interface ScanResult {
  ticker: string
  price: number
  verdict: string
  state: string
  action?: 'buy_alert' | 'sell_alert' | 'holding' | 'watching'
}

export async function scanAll(): Promise<ScanResult[]> {
  const results: ScanResult[] = []

  for (const ticker of TICKERS) {
    try {
      const snap = await fetchSnapshot(ticker)
      const entry = get(ticker)

      if (entry.state === 'watching_sell' && entry.buyAlertPrice !== null) {
        // Already in a position — check sell target
        const profit = snap.price - entry.buyAlertPrice
        const updatedEntry = { ...entry, lastChecked: new Date().toISOString() }

        if (profit >= PROFIT_TARGET) {
          await notifySell(ticker, snap.price, entry.buyAlertPrice)
          set({ ...updatedEntry, state: 'waiting_buy', buyAlertPrice: null, buyAlertTime: null, lastReason: `Sold at $${snap.price.toFixed(2)} (+$${profit.toFixed(2)})` })
          results.push({ ticker, price: snap.price, verdict: 'SELL', state: 'waiting_buy', action: 'sell_alert' })
        } else {
          set({ ...updatedEntry, lastReason: entry.lastReason })
          results.push({ ticker, price: snap.price, verdict: `+$${profit.toFixed(2)} so far`, state: 'watching_sell', action: 'holding' })
        }
      } else {
        // Waiting for a buy signal
        const analysis = await analyze(snap)
        const now = new Date().toISOString()

        if (analysis.verdict === 'BUY') {
          await notifyBuy(ticker, snap.price, analysis.reason, analysis.confidence)
          set({
            ticker,
            state: 'watching_sell',
            buyAlertPrice: snap.price,
            buyAlertTime: now,
            lastChecked: now,
            lastReason: analysis.reason,
          })
          results.push({ ticker, price: snap.price, verdict: 'BUY', state: 'watching_sell', action: 'buy_alert' })
        } else {
          set({ ticker, state: 'waiting_buy', buyAlertPrice: null, buyAlertTime: null, lastChecked: now, lastReason: analysis.reason })
          results.push({ ticker, price: snap.price, verdict: 'HOLD', state: 'waiting_buy', action: 'watching' })
        }
      }
    } catch (err) {
      results.push({ ticker, price: 0, verdict: 'ERROR', state: 'unknown' })
      console.error(`[watcher] ${ticker}:`, err)
    }
  }

  return results
}
