export const TICKERS = ['TSLA', 'GOOGL', 'PLTR', 'AMAT', 'NVDA', 'SPY'] as const

// Risk limits
export const MAX_LOSS_PER_TRADE = 500  // dollars per trade
export const MAX_CONTRACTS = 1         // keep small for safety
export const SPREAD_WIDTH = 5          // dollars between strikes

// Signal thresholds
export const RSI_OVERSOLD = 32
export const RSI_OVERBOUGHT = 68
export const EARNINGS_WINDOW_DAYS = 7
export const IV_SPIKE_THRESHOLD = 0.45 // 45% IV rank = high

// Option selection
export const TARGET_DTE_MIN = 25  // minimum days to expiration
export const TARGET_DTE_MAX = 50  // maximum days to expiration

// Notifications — set NTFY_TOPIC env var to your ntfy.sh topic name
// Install ntfy app on phone → subscribe to same topic
export const NTFY_TOPIC = process.env.NTFY_TOPIC ?? 'rh-bot-alerts'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Robinhood auth token — set via env var, never hardcode
export const RH_TOKEN = process.env.ROBINHOOD_TOKEN ?? ''
export const RH_BASE = 'https://api.robinhood.com'
