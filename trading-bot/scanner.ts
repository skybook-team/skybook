import { randomUUID } from 'crypto'
import { TICKERS, RH_TOKEN, MAX_LOSS_PER_TRADE } from './config'
import {
  getQuotes, getHistoricals, getEarningsDate,
  getInstrumentId, getOptionChain, getOptionInstruments, getOptionQuotes,
} from './robinhood'
import { detectSignals } from './signals'
import { chooseStrategy, buildStrategy, selectExpiry } from './strategies'
import { upsertTrade, pendingTrades } from './store'
import { sendTradeAlert, sendErrorAlert } from './notifier'
import { ivRank } from './indicators'
import type { RHOptionInstrument, RHOptionQuote } from './types'

export interface ScanResult {
  ticker: string
  status: 'trade_found' | 'no_signal' | 'skipped' | 'error'
  tradeId?: string
  error?: string
}

export async function scanTicker(ticker: string): Promise<ScanResult> {
  const token = RH_TOKEN
  if (!token) return { ticker, status: 'error', error: 'ROBINHOOD_TOKEN not set' }

  // Skip if we already have a pending trade for this ticker
  if (pendingTrades().some(t => t.ticker === ticker)) {
    return { ticker, status: 'skipped' }
  }

  try {
    // 1. Fetch price history and current quote
    const [historical, quotes] = await Promise.all([
      getHistoricals(ticker, token),
      getQuotes([ticker], token),
    ])

    const quote = quotes[0]
    if (!quote) throw new Error('No quote returned')
    const price = parseFloat(quote.last_trade_price)
    const closes = historical.historicals.map(h => parseFloat(h.close_price))

    // 2. Earnings
    const earningsDate = await getEarningsDate(ticker, token)

    // 3. Get option chain for IV data
    const instrumentId = await getInstrumentId(ticker, token)
    const chain = await getOptionChain(instrumentId, token)
    if (!chain) throw new Error('No option chain found')

    const expiry = selectExpiry(chain.expiration_dates, earningsDate)
    if (!expiry) return { ticker, status: 'no_signal' }

    const [callInsts, putInsts] = await Promise.all([
      getOptionInstruments(chain.id, expiry, 'call', token),
      getOptionInstruments(chain.id, expiry, 'put', token),
    ])

    const allUrls = [...callInsts, ...putInsts].map(i => i.url)
    const optionQuotesList = allUrls.length
      ? await getOptionQuotes(allUrls, token)
      : []

    const quoteMap = new Map<string, RHOptionQuote>(
      optionQuotesList.map(q => [q.instrument, q])
    )
    const callQuotes = new Map<string, RHOptionQuote>(
      callInsts.filter(i => quoteMap.has(i.url)).map(i => [i.url, quoteMap.get(i.url)!])
    )
    const putQuotes = new Map<string, RHOptionQuote>(
      putInsts.filter(i => quoteMap.has(i.url)).map(i => [i.url, quoteMap.get(i.url)!])
    )

    // 4. Estimate IV rank from ATM options
    const atmCall = callInsts.find(i =>
      Math.abs(parseFloat(i.strike_price) - price) < price * 0.03
    )
    const currentIV = atmCall && quoteMap.has(atmCall.url)
      ? parseFloat(quoteMap.get(atmCall.url)!.implied_volatility)
      : 0.3

    // Use spread of available IVs as a proxy for IV history
    const allIVs = optionQuotesList
      .map(q => parseFloat(q.implied_volatility))
      .filter(v => !isNaN(v) && v > 0)
    const ivRankVal = ivRank(currentIV, allIVs)

    // 5. Generate signals
    const signals = detectSignals(ticker, closes, price, earningsDate, currentIV, ivRankVal)
    if (!signals.length) return { ticker, status: 'no_signal' }

    // 6. Choose and build strategy
    const strategyType = chooseStrategy(signals)
    const tradeId = randomUUID()

    const trade = buildStrategy(
      tradeId, ticker, price, strategyType, signals,
      callInsts, putInsts, callQuotes, putQuotes,
    )

    if (!trade) return { ticker, status: 'no_signal' }
    if (trade.maxLoss > MAX_LOSS_PER_TRADE) {
      return { ticker, status: 'no_signal' }
    }

    // 7. Store and alert
    upsertTrade(trade)
    await sendTradeAlert(trade)

    return { ticker, status: 'trade_found', tradeId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sendErrorAlert(ticker, msg).catch(() => {})
    return { ticker, status: 'error', error: msg }
  }
}

export async function runScan(): Promise<ScanResult[]> {
  const results: ScanResult[] = []
  // Sequential to avoid rate limiting
  for (const ticker of TICKERS) {
    results.push(await scanTicker(ticker))
  }
  return results
}
