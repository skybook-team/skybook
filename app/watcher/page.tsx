'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { WatchEntry } from '@/watcher/store'

export default function WatcherPage() {
  const [entries, setEntries] = useState<WatchEntry[]>([])
  const [prices, setPrices] = useState<Record<string, number | null>>({})
  const [sellAlerts, setSellAlerts] = useState<string[]>([])
  const [scanning, setScanning] = useState(false)
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  const audioRef = useRef<AudioContext | null>(null)

  const loadEntries = useCallback(async () => {
    const res = await fetch('/api/watcher/status')
    const data = await res.json()
    setEntries(data.entries ?? [])
  }, [])

  const priceCheck = useCallback(async () => {
    const res = await fetch('/api/watcher/price-check')
    const data = await res.json()
    setPrices(data.prices ?? {})
    setLastCheck(data.checkedAt)
    if (data.sellAlerts?.length > 0) {
      setSellAlerts(prev => [...new Set([...prev, ...data.sellAlerts])])
      playAlert()
      await loadEntries()
    }
  }, [loadEntries])

  function playAlert() {
    try {
      const ctx = new AudioContext()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
    } catch { /* browser may block without interaction */ }
  }

  useEffect(() => {
    loadEntries()
    priceCheck()
    const interval = setInterval(priceCheck, 5000)
    return () => clearInterval(interval)
  }, [loadEntries, priceCheck])

  async function scan() {
    setScanning(true)
    await fetch('/api/watcher/scan', { method: 'POST' })
    await loadEntries()
    await priceCheck()
    setScanning(false)
  }

  function dismissAlert(ticker: string) {
    setSellAlerts(prev => prev.filter(t => t !== ticker))
  }

  function livePrice(entry: WatchEntry): number | null {
    return prices[entry.ticker] ?? null
  }

  function profitSoFar(entry: WatchEntry): number | null {
    const p = livePrice(entry)
    if (p === null || entry.buyAlertPrice === null) return null
    return p - entry.buyAlertPrice
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Sell alerts banner */}
      {sellAlerts.map(ticker => (
        <div key={ticker} className="mb-4 flex items-center justify-between bg-red-600 text-white rounded-xl px-4 py-3 animate-pulse">
          <span className="font-bold text-base">SELL {ticker} — $10 target reached!</span>
          <button onClick={() => dismissAlert(ticker)} className="ml-4 text-white/80 hover:text-white text-lg leading-none">✕</button>
        </div>
      ))}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Watcher</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            AI buy alerts · Sell at +$10 · Live prices every 5s
          </p>
        </div>
        <button
          onClick={scan}
          disabled={scanning}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {scanning ? 'Scanning…' : 'Scan Now'}
        </button>
      </div>

      {lastCheck && (
        <p className="text-xs text-gray-400 mb-4">
          Prices updated: {new Date(lastCheck).toLocaleTimeString()}
        </p>
      )}

      {entries.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-16">
          No data yet — hit Scan Now or wait for the cron.
        </p>
      )}

      <div className="space-y-3">
        {entries.map(e => {
          const live = livePrice(e)
          const profit = profitSoFar(e)
          const target = e.buyAlertPrice !== null ? e.buyAlertPrice + 10 : null
          const pct = profit !== null && target !== null && e.buyAlertPrice !== null
            ? Math.min((profit / 10) * 100, 100)
            : 0

          return (
            <div
              key={e.ticker}
              className={`rounded-xl border p-4 ${
                e.state === 'watching_sell'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-900">{e.ticker}</span>
                    {e.state === 'watching_sell' ? (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        Target ${target?.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                        Waiting for buy
                      </span>
                    )}
                    {live !== null && (
                      <span className="text-xs font-mono font-semibold text-gray-700">
                        ${live.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {e.state === 'watching_sell' && e.buyAlertPrice !== null && profit !== null && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-700">
                          Buy alert @ ${e.buyAlertPrice.toFixed(2)} · {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                        </span>
                        <span className="text-gray-400">{pct.toFixed(0)}% to target</span>
                      </div>
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 truncate">{e.lastReason}</p>
                </div>

                {e.lastChecked && (
                  <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {new Date(e.lastChecked).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
