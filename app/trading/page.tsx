'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Trade } from '@/trading-bot/types'

const STRATEGY_LABEL: Record<string, string> = {
  BULL_CALL_SPREAD: 'Bull Call Spread',
  BULL_PUT_SPREAD: 'Bull Put Spread',
  BEAR_PUT_SPREAD: 'Bear Put Spread',
  BEAR_CALL_SPREAD: 'Bear Call Spread',
  IRON_CONDOR: 'Iron Condor',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-gray-100 text-gray-600',
  EXECUTED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

function isBullish(s: string) {
  return s.startsWith('BULL')
}

export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/trading-bot/trades')
    const data = await res.json()
    setTrades(data.trades ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-select highlighted trade from push notification link
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (id) {
      const el = document.getElementById(`trade-${id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [trades])

  async function act(id: string, action: 'approve' | 'reject') {
    setActing(id)
    await fetch(`/api/trading-bot/${id}/${action}`, { method: 'POST' })
    await load()
    setActing(null)
  }

  async function triggerScan() {
    setScanning(true)
    await fetch('/api/trading-bot/scan', { method: 'POST' })
    await load()
    setScanning(false)
  }

  const pending = trades.filter(t => t.status === 'PENDING')
  const history = trades.filter(t => t.status !== 'PENDING')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Bot</h1>
          <p className="text-sm text-gray-500 mt-0.5">All strategies are defined-risk</p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {scanning ? 'Scanning…' : 'Scan Now'}
        </button>
      </div>

      {loading && (
        <p className="text-gray-400 text-sm text-center py-12">Loading…</p>
      )}

      {!loading && pending.length === 0 && (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm mb-8">
          No pending alerts — bot will push a notification when a signal fires.
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Pending ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map(t => (
              <TradeCard
                key={t.id}
                trade={t}
                acting={acting === t.id}
                onApprove={() => act(t.id, 'approve')}
                onReject={() => act(t.id, 'reject')}
              />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            History
          </h2>
          <div className="space-y-3">
            {history.slice(0, 20).map(t => (
              <TradeCard key={t.id} trade={t} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function TradeCard({
  trade: t,
  compact,
  acting,
  onApprove,
  onReject,
}: {
  trade: Trade
  compact?: boolean
  acting?: boolean
  onApprove?: () => void
  onReject?: () => void
}) {
  const bull = isBullish(t.strategy)
  const dirColor = t.strategy === 'IRON_CONDOR'
    ? 'text-purple-600'
    : bull ? 'text-green-600' : 'text-red-600'

  return (
    <div
      id={`trade-${t.id}`}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-lg font-bold text-gray-900">{t.ticker}</span>
          <span className={`ml-2 text-sm font-semibold ${dirColor}`}>
            {STRATEGY_LABEL[t.strategy]}
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status]}`}>
          {t.status}
        </span>
      </div>

      {/* Signals */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {t.signals.map((s, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {s.detail}
          </span>
        ))}
      </div>

      {/* Risk */}
      <div className="grid grid-cols-3 gap-3 mb-3 text-center">
        <RiskStat label="Max Loss" value={`$${t.maxLoss}`} danger />
        <RiskStat label="Max Profit" value={`$${t.maxProfit}`} />
        <RiskStat label="Stock Price" value={`$${t.price.toFixed(2)}`} />
      </div>

      {/* Legs */}
      {!compact && (
        <div className="border-t border-gray-100 pt-3 mt-1 space-y-1">
          {t.legs.map((leg, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-500">
              <span>
                <span className={leg.action === 'buy' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {leg.action.toUpperCase()}
                </span>
                {' '}{leg.type.toUpperCase()} ${leg.strike} exp {leg.expiration}
              </span>
              <span>${leg.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {t.status === 'PENDING' && onApprove && onReject && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onApprove}
            disabled={acting}
            className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {acting ? '…' : '✓ Approve & Execute'}
          </button>
          <button
            onClick={onReject}
            disabled={acting}
            className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            ✕ Reject
          </button>
        </div>
      )}

      {t.error && (
        <p className="mt-2 text-xs text-red-500 truncate" title={t.error}>{t.error}</p>
      )}
    </div>
  )
}

function RiskStat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg py-2 px-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${danger ? 'text-red-600' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  )
}
