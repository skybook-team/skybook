import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { Trade } from './types'

// File-based store using /tmp — replace with Supabase/KV in production.
const DIR = '/tmp/rh-bot'
const FILE = join(DIR, 'trades.json')

function load(): Trade[] {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as Trade[]
  } catch {
    return []
  }
}

function save(trades: Trade[]): void {
  mkdirSync(DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(trades, null, 2), 'utf8')
}

export function getAllTrades(): Trade[] {
  return load()
}

export function getTrade(id: string): Trade | null {
  return load().find(t => t.id === id) ?? null
}

export function upsertTrade(trade: Trade): void {
  const trades = load()
  const idx = trades.findIndex(t => t.id === trade.id)
  if (idx >= 0) trades[idx] = trade
  else trades.unshift(trade)
  // Keep only last 200 trades
  save(trades.slice(0, 200))
}

export function updateTradeStatus(
  id: string,
  patch: Partial<Pick<Trade, 'status' | 'rhOrderId' | 'error'>>,
): Trade | null {
  const trades = load()
  const trade = trades.find(t => t.id === id)
  if (!trade) return null
  Object.assign(trade, patch, { updatedAt: new Date().toISOString() })
  save(trades)
  return trade
}

export function pendingTrades(): Trade[] {
  return load().filter(t => t.status === 'PENDING')
}
