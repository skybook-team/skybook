export type SignalType =
  | 'RSI_OVERSOLD'
  | 'RSI_OVERBOUGHT'
  | 'BREAKOUT_UP'
  | 'BREAKOUT_DOWN'
  | 'MA_CROSS_GOLDEN'
  | 'MA_CROSS_DEATH'

export interface Signal {
  type: SignalType
  ticker: string
  detail: string
  strength: number // 0–1
}

export type StrategyType =
  | 'BULL_CALL_SPREAD'
  | 'BULL_PUT_SPREAD'
  | 'BEAR_PUT_SPREAD'
  | 'BEAR_CALL_SPREAD'
  | 'IRON_CONDOR'

export type TradeStatus = 'PENDING' | 'DONE' | 'DISMISSED'

export interface Trade {
  id: string
  ticker: string
  price: number
  strategy: StrategyType
  signals: Signal[]
  status: TradeStatus
  createdAt: string
  updatedAt: string
  error?: string
}
