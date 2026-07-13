import { RH_BASE } from './config'
import type {
  RHQuote, RHHistoricalsResult, RHInstrument,
  RHOptionChain, RHOptionInstrument, RHOptionQuote, RHAccount,
} from './types'

async function rhGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${RH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`RH ${path} → ${res.status}: ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

export async function getAccount(token: string): Promise<RHAccount> {
  const data = await rhGet<{ results: RHAccount[] }>('/accounts/', token)
  if (!data.results.length) throw new Error('No Robinhood account found')
  return data.results[0]
}

export async function getQuotes(symbols: string[], token: string): Promise<RHQuote[]> {
  const data = await rhGet<{ results: RHQuote[] }>(
    `/quotes/?symbols=${symbols.join(',')}`,
    token,
  )
  return data.results
}

export async function getHistoricals(symbol: string, token: string): Promise<RHHistoricalsResult> {
  const data = await rhGet<{ results: RHHistoricalsResult[] }>(
    `/historicals/?symbols=${symbol}&interval=day&span=3month&bounds=regular`,
    token,
  )
  return data.results[0]
}

export async function getEarningsDate(symbol: string, token: string): Promise<string | null> {
  try {
    const data = await rhGet<{ results: Array<{ report: { date: string } | null }> }>(
      `/marketdata/earnings/?symbol=${symbol}`,
      token,
    )
    const next = data.results.find(r => r.report?.date && r.report.date >= new Date().toISOString().slice(0, 10))
    return next?.report?.date ?? null
  } catch {
    return null
  }
}

export async function getInstrumentId(symbol: string, token: string): Promise<string> {
  const data = await rhGet<{ results: RHInstrument[] }>(
    `/instruments/?symbol=${symbol}`,
    token,
  )
  if (!data.results.length) throw new Error(`No instrument found for ${symbol}`)
  return data.results[0].id
}

export async function getOptionChain(instrumentId: string, token: string): Promise<RHOptionChain | null> {
  const data = await rhGet<{ results: RHOptionChain[] }>(
    `/options/chains/?equity_instrument_ids=${instrumentId}`,
    token,
  )
  return data.results[0] ?? null
}

export async function getOptionInstruments(
  chainId: string,
  expirationDate: string,
  type: 'call' | 'put',
  token: string,
): Promise<RHOptionInstrument[]> {
  const data = await rhGet<{ results: RHOptionInstrument[] }>(
    `/options/instruments/?chain_id=${chainId}&expiration_dates=${expirationDate}&state=active&type=${type}`,
    token,
  )
  return data.results
}

export async function getOptionQuotes(
  instrumentUrls: string[],
  token: string,
): Promise<RHOptionQuote[]> {
  const encoded = instrumentUrls.map(encodeURIComponent).join(',')
  const data = await rhGet<{ results: RHOptionQuote[] }>(
    `/marketdata/options/?instruments=${encoded}`,
    token,
  )
  return data.results
}

export async function placeOptionOrder(
  accountUrl: string,
  legs: Array<{ option: string; side: 'buy' | 'sell'; position_effect: 'open' | 'close'; ratio_quantity: number }>,
  quantity: number,
  price: number,
  token: string,
): Promise<{ id: string }> {
  const body = {
    account: accountUrl,
    direction: legs[0].side === 'buy' ? 'debit' : 'credit',
    legs,
    quantity: String(quantity),
    price: price.toFixed(2),
    time_in_force: 'gfd',
    type: 'limit',
    trigger: 'immediate',
    override_day_trade_checks: false,
  }
  const res = await fetch(`${RH_BASE}/options/orders/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Place order failed ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json() as Promise<{ id: string }>
}
