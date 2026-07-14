import type { Signal, StrategyType } from './types'
import { isBullish, isBearish } from './signals'

export function chooseStrategy(signals: Signal[]): StrategyType {
  const bullish = isBullish(signals)
  const bearish = isBearish(signals)
  if (!bullish && !bearish) return 'IRON_CONDOR'
  if (bullish) return 'BULL_CALL_SPREAD'
  if (bearish) return 'BEAR_PUT_SPREAD'
  return 'IRON_CONDOR'
}
