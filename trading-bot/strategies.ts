import type { OptionLeg, StrategyType, Trade } from './types'
import type { RHOptionInstrument, RHOptionQuote } from './types'
import { SPREAD_WIDTH, MAX_CONTRACTS, TARGET_DTE_MIN, TARGET_DTE_MAX } from './config'
import { isBullish, isBearish, isHighIV, isEarningsPlay } from './signals'
import type { Signal } from './types'

function mid(q: RHOptionQuote): number {
  const ask = parseFloat(q.ask_price)
  const bid = parseFloat(q.bid_price)
  return Math.round(((ask + bid) / 2) * 100) / 100
}

// Find the best expiry: 25-50 DTE, or nearest weekly after earnings
export function selectExpiry(dates: string[], earningsDate?: string | null): string | null {
  const today = new Date()
  const candidates = dates
    .map(d => ({ d, days: Math.round((new Date(d).getTime() - today.getTime()) / 86_400_000) }))
    .filter(({ days }) => days >= TARGET_DTE_MIN && days <= TARGET_DTE_MAX)
    .sort((a, b) => a.days - b.days)

  if (earningsDate) {
    // For earnings plays, pick nearest expiry after earnings
    const earningsTs = new Date(earningsDate).getTime()
    const afterEarnings = dates
      .filter(d => new Date(d).getTime() >= earningsTs)
      .sort()
    if (afterEarnings.length) return afterEarnings[0]
  }

  return candidates[0]?.d ?? null
}

function findStrike(
  instruments: RHOptionInstrument[],
  quotes: Map<string, RHOptionQuote>,
  targetStrike: number,
): { inst: RHOptionInstrument; quote: RHOptionQuote } | null {
  const sorted = instruments
    .filter(i => quotes.has(i.url))
    .sort((a, b) =>
      Math.abs(parseFloat(a.strike_price) - targetStrike) -
      Math.abs(parseFloat(b.strike_price) - targetStrike)
    )
  const inst = sorted[0]
  if (!inst) return null
  const quote = quotes.get(inst.url)!
  return { inst, quote }
}

// Pick strategy type based on signals
export function chooseStrategy(signals: Signal[]): StrategyType {
  const earnings = isEarningsPlay(signals)
  const highIV = isHighIV(signals)
  const bullish = isBullish(signals)
  const bearish = isBearish(signals)

  if (earnings || (!bullish && !bearish)) return 'IRON_CONDOR'
  if (bullish && highIV) return 'BULL_PUT_SPREAD'
  if (bullish && !highIV) return 'BULL_CALL_SPREAD'
  if (bearish && highIV) return 'BEAR_CALL_SPREAD'
  return 'BEAR_PUT_SPREAD'
}

interface LegSet {
  legs: OptionLeg[]
  netDebit: number
  maxLoss: number
  maxProfit: number
  breakevenLow: number
  breakevenHigh: number
}

function buildSpread(
  action1: 'buy' | 'sell',
  type: 'call' | 'put',
  strike1: number,
  strike2: number,
  inst1: RHOptionInstrument,
  q1: RHOptionQuote,
  inst2: RHOptionInstrument,
  q2: RHOptionQuote,
  stockPrice: number,
): LegSet {
  const price1 = mid(q1)
  const price2 = mid(q2)
  const action2: 'buy' | 'sell' = action1 === 'buy' ? 'sell' : 'buy'

  // net debit: positive = we pay, negative = we receive
  const net = action1 === 'buy'
    ? price1 - price2
    : price2 - price1

  const width = Math.abs(strike2 - strike1)
  const maxLoss = net > 0 ? net * 100 : (width - Math.abs(net)) * 100
  const maxProfit = net > 0 ? (width - net) * 100 : Math.abs(net) * 100

  const expiry = inst1.expiration_date

  let breakevenLow: number, breakevenHigh: number
  if (type === 'call') {
    const be = (action1 === 'buy' ? strike1 : strike1) + (net > 0 ? net : -net)
    breakevenLow = be
    breakevenHigh = be
  } else {
    const be = (action1 === 'buy' ? strike1 : strike1) - Math.abs(net)
    breakevenLow = be
    breakevenHigh = be
  }

  return {
    netDebit: net,
    maxLoss: Math.round(maxLoss * 100) / 100,
    maxProfit: Math.round(maxProfit * 100) / 100,
    breakevenLow: Math.round(breakevenLow * 100) / 100,
    breakevenHigh: Math.round(breakevenHigh * 100) / 100,
    legs: [
      { action: action1, type, strike: strike1, expiration: expiry, price: price1, instrumentUrl: inst1.url },
      { action: action2, type, strike: strike2, expiration: expiry, price: price2, instrumentUrl: inst2.url },
    ],
  }
}

export function buildStrategy(
  id: string,
  ticker: string,
  stockPrice: number,
  strategy: StrategyType,
  signals: Signal[],
  callInstruments: RHOptionInstrument[],
  putInstruments: RHOptionInstrument[],
  callQuotes: Map<string, RHOptionQuote>,
  putQuotes: Map<string, RHOptionQuote>,
): Trade | null {
  const width = SPREAD_WIDTH

  try {
    if (strategy === 'BULL_CALL_SPREAD') {
      const atm = findStrike(callInstruments, callQuotes, stockPrice)
      const otm = findStrike(callInstruments, callQuotes, stockPrice + width)
      if (!atm || !otm) return null
      const set = buildSpread('buy', 'call',
        parseFloat(atm.inst.strike_price), parseFloat(otm.inst.strike_price),
        atm.inst, atm.quote, otm.inst, otm.quote, stockPrice)
      return makeTrade(id, ticker, stockPrice, strategy, signals, set)
    }

    if (strategy === 'BULL_PUT_SPREAD') {
      const sell = findStrike(putInstruments, putQuotes, stockPrice - width * 0.5)
      const buy = findStrike(putInstruments, putQuotes, stockPrice - width * 1.5)
      if (!sell || !buy) return null
      const set = buildSpread('sell', 'put',
        parseFloat(sell.inst.strike_price), parseFloat(buy.inst.strike_price),
        sell.inst, sell.quote, buy.inst, buy.quote, stockPrice)
      return makeTrade(id, ticker, stockPrice, strategy, signals, set)
    }

    if (strategy === 'BEAR_PUT_SPREAD') {
      const atm = findStrike(putInstruments, putQuotes, stockPrice)
      const otm = findStrike(putInstruments, putQuotes, stockPrice - width)
      if (!atm || !otm) return null
      const set = buildSpread('buy', 'put',
        parseFloat(atm.inst.strike_price), parseFloat(otm.inst.strike_price),
        atm.inst, atm.quote, otm.inst, otm.quote, stockPrice)
      return makeTrade(id, ticker, stockPrice, strategy, signals, set)
    }

    if (strategy === 'BEAR_CALL_SPREAD') {
      const sell = findStrike(callInstruments, callQuotes, stockPrice + width * 0.5)
      const buy = findStrike(callInstruments, callQuotes, stockPrice + width * 1.5)
      if (!sell || !buy) return null
      const set = buildSpread('sell', 'call',
        parseFloat(sell.inst.strike_price), parseFloat(buy.inst.strike_price),
        sell.inst, sell.quote, buy.inst, buy.quote, stockPrice)
      return makeTrade(id, ticker, stockPrice, strategy, signals, set)
    }

    if (strategy === 'IRON_CONDOR') {
      const putSell = findStrike(putInstruments, putQuotes, stockPrice - width)
      const putBuy = findStrike(putInstruments, putQuotes, stockPrice - width * 2)
      const callSell = findStrike(callInstruments, callQuotes, stockPrice + width)
      const callBuy = findStrike(callInstruments, callQuotes, stockPrice + width * 2)
      if (!putSell || !putBuy || !callSell || !callBuy) return null

      const putCredit = mid(putSell.quote) - mid(putBuy.quote)
      const callCredit = mid(callSell.quote) - mid(callBuy.quote)
      const totalCredit = putCredit + callCredit

      const maxLoss = (width - totalCredit) * 100
      const maxProfit = totalCredit * 100
      const expiry = putSell.inst.expiration_date

      const set: LegSet = {
        netDebit: -totalCredit,
        maxLoss: Math.round(maxLoss * 100) / 100,
        maxProfit: Math.round(maxProfit * 100) / 100,
        breakevenLow: parseFloat(putSell.inst.strike_price) - totalCredit,
        breakevenHigh: parseFloat(callSell.inst.strike_price) + totalCredit,
        legs: [
          { action: 'sell', type: 'put', strike: parseFloat(putSell.inst.strike_price), expiration: expiry, price: mid(putSell.quote), instrumentUrl: putSell.inst.url },
          { action: 'buy', type: 'put', strike: parseFloat(putBuy.inst.strike_price), expiration: expiry, price: mid(putBuy.quote), instrumentUrl: putBuy.inst.url },
          { action: 'sell', type: 'call', strike: parseFloat(callSell.inst.strike_price), expiration: expiry, price: mid(callSell.quote), instrumentUrl: callSell.inst.url },
          { action: 'buy', type: 'call', strike: parseFloat(callBuy.inst.strike_price), expiration: expiry, price: mid(callBuy.quote), instrumentUrl: callBuy.inst.url },
        ],
      }
      return makeTrade(id, ticker, stockPrice, strategy, signals, set)
    }
  } catch {
    return null
  }
  return null
}

function makeTrade(
  id: string,
  ticker: string,
  price: number,
  strategy: StrategyType,
  signals: Signal[],
  set: LegSet,
): Trade {
  const now = new Date().toISOString()
  return {
    id,
    ticker,
    price,
    strategy,
    signals,
    legs: set.legs,
    contracts: MAX_CONTRACTS,
    maxLoss: set.maxLoss,
    maxProfit: set.maxProfit,
    breakevenLow: set.breakevenLow,
    breakevenHigh: set.breakevenHigh,
    netDebit: Math.round(set.netDebit * 100) / 100,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  }
}
