import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export type WatchEntry = {
  ticker: string
  state: 'waiting_buy' | 'watching_sell'
  buyAlertPrice: number | null   // stock price when BUY alert fired
  buyAlertTime: string | null
  lastChecked: string
  lastReason: string
}

const DIR = '/tmp/rh-watcher'
const FILE = join(DIR, 'state.json')

function load(): Record<string, WatchEntry> {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8'))
  } catch {
    return {}
  }
}

function save(state: Record<string, WatchEntry>): void {
  mkdirSync(DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(state, null, 2), 'utf8')
}

export function getAll(): WatchEntry[] {
  return Object.values(load())
}

export function get(ticker: string): WatchEntry {
  return load()[ticker] ?? {
    ticker,
    state: 'waiting_buy',
    buyAlertPrice: null,
    buyAlertTime: null,
    lastChecked: '',
    lastReason: '',
  }
}

export function set(entry: WatchEntry): void {
  const state = load()
  state[entry.ticker] = entry
  save(state)
}

export function reset(ticker: string): void {
  const state = load()
  state[ticker] = {
    ticker,
    state: 'waiting_buy',
    buyAlertPrice: null,
    buyAlertTime: null,
    lastChecked: new Date().toISOString(),
    lastReason: 'manually reset',
  }
  save(state)
}
