import type { Signal } from './types'
import { rsi, ema, high20, low20 } from './indicators'
import {
  RSI_OVERSOLD, RSI_OVERBOUGHT, EARNINGS_WINDOW_DAYS,
} from './config'

function daysUntil(dateStr: string): number {
  return Math.round(
    (new Date(dateStr).getTime() - Date.now()) / 86_400_000,
  )
}

export function detectSignals(
  ticker: string,
  closes: number[],
  currentPrice: number,
  earningsDate: string | null,
  currentIV: number,
  ivRankValue: number,
): Signal[] {
  const signals: Signal[] = []

  // RSI
  const rsiVal = rsi(closes)
  if (rsiVal < RSI_OVERSOLD) {
    signals.push({
      type: 'RSI_OVERSOLD',
      ticker,
      detail: `RSI ${rsiVal.toFixed(1)} — oversold`,
      strength: (RSI_OVERSOLD - rsiVal) / RSI_OVERSOLD,
    })
  } else if (rsiVal > RSI_OVERBOUGHT) {
    signals.push({
      type: 'RSI_OVERBOUGHT',
      ticker,
      detail: `RSI ${rsiVal.toFixed(1)} — overbought`,
      strength: (rsiVal - RSI_OVERBOUGHT) / (100 - RSI_OVERBOUGHT),
    })
  }

  // 20-day breakout
  const h = high20(closes.slice(0, -1)) // yesterday's 20-day high
  const l = low20(closes.slice(0, -1))
  if (currentPrice > h) {
    signals.push({
      type: 'BREAKOUT_UP',
      ticker,
      detail: `Broke above 20-day high $${h.toFixed(2)}`,
      strength: Math.min((currentPrice - h) / h / 0.02, 1),
    })
  } else if (currentPrice < l) {
    signals.push({
      type: 'BREAKOUT_DOWN',
      ticker,
      detail: `Broke below 20-day low $${l.toFixed(2)}`,
      strength: Math.min((l - currentPrice) / l / 0.02, 1),
    })
  }

  // EMA crossover
  const ema9 = ema(closes, 9)
  const ema21 = ema(closes, 21)
  if (ema9.length >= 2 && ema21.length >= 2) {
    const [prevFast, currFast] = ema9.slice(-2)
    const [prevSlow, currSlow] = ema21.slice(-2)
    if (prevFast <= prevSlow && currFast > currSlow) {
      signals.push({
        type: 'MA_CROSS_GOLDEN',
        ticker,
        detail: `EMA(9) crossed above EMA(21)`,
        strength: 0.7,
      })
    } else if (prevFast >= prevSlow && currFast < currSlow) {
      signals.push({
        type: 'MA_CROSS_DEATH',
        ticker,
        detail: `EMA(9) crossed below EMA(21)`,
        strength: 0.7,
      })
    }
  }

  // Earnings proximity
  if (earningsDate) {
    const days = daysUntil(earningsDate)
    if (days >= 0 && days <= EARNINGS_WINDOW_DAYS) {
      signals.push({
        type: 'EARNINGS_NEARBY',
        ticker,
        detail: `Earnings in ${days} day${days === 1 ? '' : 's'} (${earningsDate})`,
        strength: 1 - days / EARNINGS_WINDOW_DAYS,
      })
    }
  }

  // IV spike
  if (ivRankValue >= 0.5) {
    signals.push({
      type: 'IV_SPIKE',
      ticker,
      detail: `IV rank ${(ivRankValue * 100).toFixed(0)}% — elevated premium`,
      strength: ivRankValue,
    })
  }

  return signals
}

export function isBullish(signals: Signal[]): boolean {
  const types = signals.map(s => s.type)
  return types.includes('RSI_OVERSOLD') ||
    types.includes('BREAKOUT_UP') ||
    types.includes('MA_CROSS_GOLDEN')
}

export function isBearish(signals: Signal[]): boolean {
  const types = signals.map(s => s.type)
  return types.includes('RSI_OVERBOUGHT') ||
    types.includes('BREAKOUT_DOWN') ||
    types.includes('MA_CROSS_DEATH')
}

export function isHighIV(signals: Signal[]): boolean {
  return signals.some(s => s.type === 'IV_SPIKE')
}

export function isEarningsPlay(signals: Signal[]): boolean {
  return signals.some(s => s.type === 'EARNINGS_NEARBY')
}
