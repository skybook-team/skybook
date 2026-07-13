'use client'

import { useEffect, useState, useCallback } from 'react'
import type { WatchEntry } from '@/watcher/store'

export default function WatcherPage() {
  const [entries, setEntries] = useState<WatchEntry[]>([])
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/watcher/status')
    const data = await res.json()
    setEntries(data.entries ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function scan() {
    setScanning(true)
    const res = await fetch('/api/watcher/scan', { method: 'POST' })
    const data = await res.json()
    setLastScan(data.scannedAt)
    await load()
    setScanning(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Watcher</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Buy alert via AI · Sell at +$10 profit
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

      {lastScan && (
        <p className="text-xs text-gray-400 mb-4">
          Last scan: {new Date(lastScan).toLocaleTimeString()}
        </p>
      )}

      {entries.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-16">
          No data yet — hit Scan Now or wait for the cron to run.
        </p>
      )}

      <div className="space-y-3">
        {entries.map(e => (
          <div
            key={e.ticker}
            className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${
              e.state === 'watching_sell'
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{e.ticker}</span>
                {e.state === 'watching_sell' ? (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                    Watching sell @ ${((e.buyAlertPrice ?? 0) + 10).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                    Waiting for buy
                  </span>
                )}
              </div>

              {e.state === 'watching_sell' && e.buyAlertPrice && (
                <p className="text-xs text-green-700 mb-1">
                  Buy alert fired at ${e.buyAlertPrice.toFixed(2)}
                  {e.buyAlertTime && ` · ${new Date(e.buyAlertTime).toLocaleString()}`}
                </p>
              )}

              <p className="text-xs text-gray-500 truncate">{e.lastReason}</p>
            </div>

            {e.lastChecked && (
              <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {new Date(e.lastChecked).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
