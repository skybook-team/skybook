export type SignalType =
  | 'RSI_OVERSOLD'
  | 'RSI_OVERBOUGHT'
  | 'BREAKOUT_UP'
  | 'BREAKOUT_DOWN'
  | 'EARNINGS_NEARBY'
  | 'IV_SPIKE'
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

export type TradeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED'

export interface OptionLeg {
  action: 'buy' | 'sell'
  type: 'call' | 'put'
  strike: number
  expiration: string
  price: number // mid price per share
  instrumentUrl: string
}

export interface Trade {
  id: string
  ticker: string
  price: number // stock price at scan time
  strategy: StrategyType
  signals: Signal[]
  legs: OptionLeg[]
  contracts: number // quantity (default 1)
  maxLoss: number   // dollars, always finite
  maxProfit: number // dollars
  breakevenLow: number
  breakevenHigh: number
  netDebit: number  // positive = debit, negative = credit
  status: TradeStatus
  createdAt: string
  updatedAt: string
  rhOrderId?: string
  error?: string
}

export interface RHQuote {
  symbol: string
  last_trade_price: string
  ask_price: string
  bid_price: string
  previous_close: string
}

export interface RHCandle {
  begins_at: string
  open_price: string
  close_price: string
  high_price: string
  low_price: string
  volume: number
}

export interface RHHistoricalsResult {
  symbol: string
  historicals: RHCandle[]
}

export interface RHInstrument {
  id: string
  url: string
  symbol: string
}

export interface RHOptionChain {
  id: string
  expiration_dates: string[]
  min_ticks: { above_tick: string; below_tick: string; cutoff_price: string }
}

export interface RHOptionInstrument {
  id: string
  url: string
  strike_price: string
  expiration_date: string
  type: 'call' | 'put'
  chain_id: string
  state: string
}

export interface RHOptionQuote {
  instrument: string
  ask_price: string
  bid_price: string
  last_trade_price: string
  implied_volatility: string
  delta: string
  gamma: string
  theta: string
  vega: string
}

export interface RHAccount {
  url: string
  account_number: string
  buying_power: string
}
