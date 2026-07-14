export const TICKERS = ['TSLA', 'GOOGL', 'PLTR', 'AMAT', 'NVDA', 'SPY'] as const

export const SPREAD_WIDTH = 5

export const RSI_OVERSOLD = 32
export const RSI_OVERBOUGHT = 68
export const EARNINGS_WINDOW_DAYS = 7

export const NTFY_TOPIC = process.env.NTFY_TOPIC ?? 'rh-bot-alerts'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
